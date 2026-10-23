import numpy as np

from envelope import envelope

SR = 24000


def test_steady_tone_is_fully_open():
    t = np.arange(SR) / SR
    tone = 0.5 * np.sin(2 * np.pi * 440 * t)  # -6 dBFS
    env = envelope(tone, SR)
    assert len(env) == 50
    assert all(v > 90 for v in env)


def test_silence_is_closed():
    env = envelope(np.zeros(SR), SR)
    assert len(env) == 50
    assert all(v == 0 for v in env)


def test_values_are_integer_percent():
    t = np.arange(SR // 2) / SR
    ramp = np.linspace(0, 1, len(t)) * np.sin(2 * np.pi * 220 * t)
    env = envelope(ramp, SR)
    assert all(isinstance(v, int) and 0 <= v <= 100 for v in env)
    assert env[-1] > env[0]
