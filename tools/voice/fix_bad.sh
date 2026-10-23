#!/usr/bin/env bash
# Re-renders clips that speech recognition flags (cut endings, babble), up to N rounds.
#   bash tools/voice/fix_bad.sh tr 4
set -uo pipefail
cd "$(dirname "$0")/../.."
LANG_ID="${1:-tr}"
ROUNDS="${2:-4}"
MAXWER="${3:-0.15}"
PY=tools/voice/.venv/Scripts/python
[ -x "$PY" ] || PY=tools/voice/.venv/bin/python
export PYTHONIOENCODING=utf-8
for round in $(seq 1 "$ROUNDS"); do
  ONLY=$("$PY" tools/voice/check.py --lang "$LANG_ID" --max-wer "$MAXWER" 2>/dev/null | tee "tools/voice/out/check-$LANG_ID-$round.log" | sed -n 's/^ONLY=//p')
  COUNT=$(echo -n "$ONLY" | tr ',' '\n' | grep -c . || true)
  echo "[$LANG_ID] round $round: $COUNT flagged"
  [ "$COUNT" -eq 0 ] && break
  "$PY" tools/voice/render.py --lang "$LANG_ID" --only "$ONLY" > "tools/voice/out/render-$LANG_ID-$round.log" 2>&1
done
# Final report for whatever is still flagged.
"$PY" tools/voice/check.py --lang "$LANG_ID" --max-wer "$MAXWER" 2>/dev/null | tail -40 > "tools/voice/out/check-$LANG_ID-final.log"
grep -E "above" "tools/voice/out/check-$LANG_ID-final.log"
