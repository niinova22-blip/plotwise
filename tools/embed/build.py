"""
Builds src/mentor/react/prototypes.json from the situation examples and tunes
the matching thresholds on held-out sentences.

  npx jest --testRegex "export-situations\\.jest\\.ts$"
  tools/voice/.venv/Scripts/python tools/embed/build.py

The model must match the one the app runs on device
(react-native-executorch PARAPHRASE_MULTILINGUAL_MINILM_L12_V2).

Decision rule (mirrored in src/mentor/react/match.ts):
- crisis prototype >= crisisThreshold  -> support offer
- best ordinary situation < threshold   -> universal line
- best and runner-up within `margin` and from different families -> universal
  (same family is fine: either reaction fits)
"""

import json
import os
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "src" / "mentor" / "react" / "prototypes.json"
MODEL = os.environ.get("EMBED_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
OUT = Path(os.environ["EMBED_OUT"]) if os.environ.get("EMBED_OUT") else OUT
TRAIN = 4  # first N examples per language build the prototype; the rest are held out
MAX_CROSS_WRONG = 0.05  # at most 5% of held-out messages may get a reaction from the wrong family
MAX_OFFTOPIC = 0.05

FAMILY_PREFIX = {
    "work": ("work_",), "startup": ("startup_", "idea_", "side_"), "money": ("money_",), "rel": ("rel_",),
    "study": ("study_",), "move": ("move_",), "health": ("health_",), "creative": ("creative_",), "crisis": ("crisis_",),
}
EMOTION = {
    "fear_failure", "fear_judgment", "low_confidence", "anxious", "overwhelmed", "sad_low", "frustrated",
    "overthinking", "health_stress", "work_burnout", "work_imposter", "comparison", "no_time", "procrastination",
}

# Off-topic or niche messages: the right answer is a warm universal line.
NEGATIVES = [
    "Should I change my cat's food?", "Which colour should I paint my kitchen?", "What phone should I buy?",
    "My car makes a weird noise", "Should I adopt a second dog?", "What should I cook tonight?",
    "Which song should we play at the wedding?", "I want to rearrange my living room", "Is it better to rent a bike or walk?",
    "How do I fix my leaking tap?", "Kedimin mamasını değiştirmeli miyim?", "Mutfağı hangi renge boyasam?",
    "Hangi telefonu almalıyım?", "Arabamdan garip bir ses geliyor", "İkinci bir köpek sahiplenmeli miyim?",
    "Bu akşam ne pişirsem?", "Düğünde hangi şarkıyı çalsak?", "Salonumdaki mobilyaların yerini değiştirmek istiyorum",
    "Bahçeye domates mi ekeyim biber mi?", "Musluğum damlatıyor nasıl tamir ederim?",
]


def family(sid: str) -> str:
    if sid in EMOTION:
        return "emotion"
    for f, prefixes in FAMILY_PREFIX.items():
        if sid.startswith(prefixes):
            return f
    return sid


def unit(v: np.ndarray) -> np.ndarray:
    return v / np.linalg.norm(v, axis=-1, keepdims=True)


def main() -> None:
    sits = json.loads((HERE / "out" / "situations.json").read_text(encoding="utf-8"))
    model = SentenceTransformer(MODEL, device="cpu")
    enc = lambda xs: unit(model.encode(xs, normalize_embeddings=True))

    ids = [s["id"] for s in sits]
    fams = [family(i) for i in ids]
    is_crisis = np.array([bool(s.get("crisis")) for s in sits])
    protos = np.stack([unit(enc(s["en"][:TRAIN] + s["tr"][:TRAIN]).mean(0)) for s in sits])
    tests = [(s["id"], t) for s in sits for t in s["en"][TRAIN:] + s["tr"][TRAIN:]]
    tsims = enc([t for _, t in tests]) @ protos.T
    nsims = enc(NEGATIVES) @ protos.T

    def decide(sims, th, margin, cth):
        c = np.where(is_crisis, sims, -1)
        if c.max() >= cth:
            return ids[int(c.argmax())]
        o = np.where(is_crisis, -1, sims)
        order = np.argsort(-o)
        b, r = order[0], order[1]
        if o[b] < th:
            return None
        if o[b] - o[r] < margin and fams[b] != fams[r]:
            return None
        return ids[b]

    best = None
    for th in np.arange(0.40, 0.80, 0.01):
        for margin in (0.0, 0.02, 0.04, 0.06, 0.08):
            for cth in np.arange(0.60, 0.91, 0.02):
                got = [decide(x, th, margin, cth) for x in tsims]
                n = len(tests)
                fam_ok = sum(g is not None and family(g) == family(w) for g, (w, _) in zip(got, tests)) / n
                cross = sum(g is not None and family(g) != family(w) for g, (w, _) in zip(got, tests)) / n
                offtopic = sum(decide(x, th, margin, cth) is not None for x in nsims) / len(nsims)
                false_crisis = sum(g is not None and g.startswith("crisis_") and not w.startswith("crisis_") for g, (w, _) in zip(got, tests))
                crisis_hit = sum(g is not None and g.startswith("crisis_") for g, (w, _) in zip(got, tests) if w.startswith("crisis_"))
                if cross > MAX_CROSS_WRONG or offtopic > MAX_OFFTOPIC or false_crisis > 0:
                    continue
                score = fam_ok + 0.02 * crisis_hit
                if best is None or score > best[0]:
                    exact = sum(g == w for g, (w, _) in zip(got, tests)) / n
                    best = (score, float(th), margin, float(cth), fam_ok, exact, cross, offtopic, crisis_hit)

    _, th, margin, cth, fam_ok, exact, cross, offtopic, crisis_hit = best
    crisis_total = sum(w.startswith("crisis_") for w, _ in tests)
    print(f"threshold {th:.2f} margin {margin:.2f} crisis {cth:.2f}")
    print(f"held-out: fitting reaction {fam_ok:.1%} (exact {exact:.1%}), wrong family {cross:.1%}, rest universal")
    print(f"off-topic sent to a situation: {offtopic:.1%}; crisis offered {crisis_hit}/{crisis_total} (phrase check also blocks)")

    final = np.stack([unit(enc(s["en"] + s["tr"]).mean(0)) for s in sits])
    data = {
        "model": MODEL,
        "threshold": round(th, 3),
        "margin": margin,
        "crisisThreshold": round(cth, 3),
        "items": [
            {"id": sid, "family": fam, "vec": [round(float(x), 4) for x in vec], **({"crisis": True} if c else {})}
            for sid, fam, vec, c in zip(ids, fams, final, is_crisis)
        ],
    }
    OUT.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT} ({len(ids)} situations, dim {final.shape[1]})")


if __name__ == "__main__":
    main()
