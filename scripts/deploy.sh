#!/usr/bin/env bash
# Full VPS update: git pull, rebuild backend + frontend, restart both PM2 processes.
#
# Why this exists: `pm2 restart` alone is NOT enough after `git pull` — Next.js
# SSR changes are not live until `frontend/` is rebuilt (see README.md "Production SSR").
#
# Usage (from repo root or scripts/):
#   ./scripts/deploy.sh
#
# Env overrides:
#   BACKEND_PM2=dntech-api   FRONTEND_PM2=dntech-web   SKIP_GIT_PULL=1

set -euo pipefail

BACKEND_PM2="${BACKEND_PM2:-dntech-api}"
FRONTEND_PM2="${FRONTEND_PM2:-dntech-web}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

log() { printf '%s\n' "$*" >&2; }

die() {
  log "error: $*"
  exit 1
}

banner() {
  log ""
  log "==> $*"
}

step_git_pull() {
  if [[ "${SKIP_GIT_PULL:-}" == "1" ]]; then
    banner "Skipping git pull (SKIP_GIT_PULL=1)"
    return 0
  fi
  banner "git pull --rebase origin main"
  cd "$ROOT_DIR"
  git pull --rebase origin main
}

step_backend_build() {
  banner "Backend: npm ci"
  cd "$BACKEND_DIR"
  npm ci

  banner "Backend: npx prisma generate"
  npx prisma generate

  banner "Backend: npm run build"
  npm run build

  banner "Backend: pm2 restart ${BACKEND_PM2}"
  pm2 restart "$BACKEND_PM2"
}

step_frontend_build() {
  banner "Frontend: npm ci"
  cd "$FRONTEND_DIR"
  npm ci

  banner "Frontend: npm run build"
  npm run build

  banner "Frontend: pm2 restart ${FRONTEND_PM2}"
  pm2 restart "$FRONTEND_PM2"
}

main() {
  [[ -d "$BACKEND_DIR" ]] || die "backend dir not found: $BACKEND_DIR"
  [[ -d "$FRONTEND_DIR" ]] || die "frontend dir not found: $FRONTEND_DIR"
  command -v pm2 >/dev/null 2>&1 || die "pm2 not found on PATH"

  step_git_pull
  step_backend_build
  step_frontend_build

  banner "Deploy complete: backend (${BACKEND_PM2}) + frontend (${FRONTEND_PM2}) rebuilt and restarted"
}

main "$@"
