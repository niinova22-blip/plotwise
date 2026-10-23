"""Loudness envelope that drives Ozan's jaw: one value per 20 ms, 0..100."""

import numpy as np

FRAME_MS = 20


def envelope(samples: np.ndarray, sr: int) -> list[int]:
    hop = int(sr * FRAME_MS / 1000)
    n = int(np.ceil(len(samples) / hop))
    rms = np.array([np.sqrt(np.mean(samples[i * hop:(i + 1) * hop] ** 2)) if len(samples[i * hop:(i + 1) * hop]) else 0.0 for i in range(n)])
    peak = rms.max() if n else 0.0
    if peak < 1e-6:
        return [0] * n
    # A soft curve so quiet syllables still move the mouth a little.
    shaped = (rms / peak) ** 0.7
    return [int(round(min(1.0, v) * 100)) for v in shaped]
