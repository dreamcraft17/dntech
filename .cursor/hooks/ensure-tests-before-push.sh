#!/bin/bash
set -euo pipefail

payload="$(cat)"
command="$(printf '%s' "$payload" | jq -r '.command // ""')"

if [[ ! "$command" =~ ^[[:space:]]*git[[:space:]]+push\b ]]; then
  echo '{ "permission": "allow" }'
  exit 0
fi

missing=()

if [[ ! -f "backend/coverage/coverage-summary.json" ]]; then
  missing+=("backend")
fi

if [[ ! -f "frontend/coverage/coverage-summary.json" ]]; then
  missing+=("frontend")
fi

if [[ ${#missing[@]} -gt 0 ]]; then
  echo '{
    "permission": "deny",
    "user_message": "Push diblokir: jalankan coverage test backend+frontend dulu (`cd backend && npm run test:coverage` dan `cd ../frontend && npm run test:coverage`).",
    "agent_message": "Blocked git push because coverage artifacts are missing."
  }'
  exit 0
fi

echo '{ "permission": "allow" }'
