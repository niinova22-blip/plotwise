"""
Listens to rendered clips with speech recognition and flags lines whose words
don't match the script (cut-off endings, garbled or accented words).

  tools/voice/.venv/Scripts/python tools/voice/check.py --lang tr [--max-wer 0.15]

Prints the failing ids comma-separated, ready for `render.py --only ...`.
"""

import argparse
import json
import re
import subprocess
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent.parent / "assets" / "voice"


def words(text: str, lang: str) -> list[str]:
    text = text.replace("İ", "i").replace("I", "ı") if lang == "tr" else text
    text = unicodedata.normalize("NFC", text.lower()).replace("’", "'").replace("‘", "'")
    return re.findall(r"[\w']+", text)


def load(path: Path):
    import numpy as np

    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def wer(ref: list[str], hyp: list[str]) -> float:
    d = list(range(len(hyp) + 1))
    for i, r in enumerate(ref, 1):
        prev, d[0] = d[0], i
        for j, h in enumerate(hyp, 1):
            cur = min(d[j] + 1, d[j - 1] + 1, prev + (r != h))
            prev, d[j] = d[j], cur
    return d[len(hyp)] / max(1, len(ref))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", required=True, choices=["en", "tr"])
    ap.add_argument("--max-wer", type=float, default=0.15)
    ap.add_argument("--model", default="small")
    ap.add_argument("--ids", default="", help="comma-separated ids to check (default: all)")
    args = ap.parse_args()

    from faster_whisper import WhisperModel

    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    cache = json.loads((HERE / "out" / "cache.json").read_text(encoding="utf-8"))
    ids = {i for i in args.ids.split(",") if i}
    bad, scores = [], []
    for line_id, e in sorted(cache.get(args.lang, {}).items()):
        if ids and line_id not in ids:
            continue
        segments, _ = model.transcribe(load(ASSETS / e["file"]), language=args.lang, beam_size=5)
        heard = " ".join(s.text for s in segments)
        score = wer(words(e["text"], args.lang), words(heard, args.lang))
        scores.append(score)
        if score > args.max_wer:
            bad.append(line_id)
            print(f"{score:.2f}  {line_id}\n      script: {e['text']}\n      heard:  {heard.strip()}")
    if scores:
        print(f"\n{len(bad)}/{len(scores)} above {args.max_wer}; mean WER {sum(scores) / len(scores):.3f}")
    print("ONLY=" + ",".join(bad))


if __name__ == "__main__":
    main()
