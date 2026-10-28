#!/usr/bin/env bash
# Short alias for VPS: pull + build backend + build frontend + PM2 restart.
# Usage from repo root:  ./scripts/update.sh
# Same as:              npm run update
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "${SCRIPT_DIR}/deploy.sh" "$@"
