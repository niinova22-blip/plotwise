"""Prints raw matching quality for mean-prototype vs kNN scoring (no thresholds)."""

import json
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

import sys

from build import MODEL, NEGATIVES, TRAIN, unit

MODEL = sys.argv[1] if len(sys.argv) > 1 else MODEL

HERE = Path(__file__).resolve().parent
sits = json.loads((HERE / "out" / "situations.json").read_text(encoding="utf-8"))
model = SentenceTransformer(MODEL, device="cpu", trust_remote_code=True)
PREFIX = "query: " if "e5" in MODEL else ""
enc = lambda xs: unit(model.encode([PREFIX + x for x in xs], normalize_embeddings=True))
ids = [s["id"] for s in sits]
banks = [enc(s["en"][:TRAIN] + s["tr"][:TRAIN]) for s in sits]
means = np.stack([unit(b.mean(0)) for b in banks])
tests = [(s["id"], t) for s in sits for t in s["en"][TRAIN:] + s["tr"][TRAIN:]]
tv = enc([t for _, t in tests])
nv = enc(NEGATIVES)

for name, score in {
    "mean": lambda v: means @ v,
    "knn1": lambda v: np.array([np.max(b @ v) for b in banks]),
    "knn2": lambda v: np.array([np.sort(b @ v)[-2:].mean() for b in banks]),
}.items():
    top1 = [ids[int(np.argmax(score(v)))] == want for v, (want, _) in zip(tv, tests)]
    top3 = [want in [ids[i] for i in np.argsort(-score(v))[:3]] for v, (want, _) in zip(tv, tests)]
    pos = [score(v).max() for v, ok in zip(tv, top1) if ok]
    wrong = [score(v).max() for v, ok in zip(tv, top1) if not ok]
    neg = [score(v).max() for v in nv]
    print(f"{name}: top1 {np.mean(top1):.1%} top3 {np.mean(top3):.1%} | best-sim correct {np.median(pos):.2f} wrong {np.median(wrong):.2f} offtopic {np.median(neg):.2f} (max {np.max(neg):.2f})")

FAMILY = {
    "work": "work_", "startup": ("startup_", "idea_", "side_"), "money": "money_", "rel": "rel_", "study": "study_",
    "move": "move_", "health": "health_", "creative": "creative_", "crisis": "crisis_",
}
EMOTION = {"fear_failure", "fear_judgment", "low_confidence", "anxious", "overwhelmed", "sad_low", "frustrated", "overthinking", "health_stress", "work_burnout", "work_imposter", "comparison"}


def family(i: str) -> str:
    for f, p in FAMILY.items():
        if i.startswith(p):
            return f
    return "emotion" if i in EMOTION else i


for v, (want, text) in zip(tv, tests):
    sims = means @ v
    got = ids[int(np.argmax(sims))]
    if got != want and family(got) != family(want):
        print(f"  {want:22s} -> {got:22s} {sims.max():.2f}  {text}")
fam = [family(ids[int(np.argmax(means @ v))]) == family(want) for v, (want, _) in zip(tv, tests)]
print(f"mean family top1 {np.mean(fam):.1%}")
