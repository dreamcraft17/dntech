#!/usr/bin/env bash
# Short alias for VPS: pull + build backend + build frontend + PM2 restart.
# Usage from repo root:  ./scripts/update.sh
# Same as:              npm run update
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy.sh" "$@"
