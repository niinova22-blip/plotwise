#!/usr/bin/env bash
# One-time setup of the local voice-rendering environment (Windows Git Bash or Linux).
set -euo pipefail
cd "$(dirname "$0")"
python -m venv .venv
PY=.venv/Scripts/python
[ -x "$PY" ] || PY=.venv/bin/python
"$PY" -m pip install --upgrade pip
"$PY" -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128
"$PY" -m pip install chatterbox-tts --no-deps
"$PY" -m pip install -r requirements.txt
"$PY" -c "import torch; print('cuda', torch.cuda.is_available(), torch.__version__)"
