#!/usr/bin/env bash
# VPS production update: git pull → backend (./backend) → frontend (./frontend) → PM2.
#
# One command from repo root (e.g. ~/dntech or /var/www/dntech):
#   ./scripts/update.sh
#   npm run update
#   ./scripts/deploy.sh
#
# Env overrides:
#   GIT_BRANCH=main          SKIP_GIT_PULL=1
#   BACKEND_PM2=dntech-api   FRONTEND_PM2=dntech-web   BLOG_WORKER_PM2=dntech-blog-worker
#
# Flags:
#   --skip-pull       Same as SKIP_GIT_PULL=1
#   --backend-only    Skip frontend build/restart
#   --frontend-only   Skip backend build/restart (still runs git pull unless --skip-pull)

set -euo pipefail

BACKEND_PM2="${BACKEND_PM2:-dntech-api}"
BLOG_WORKER_PM2="${BLOG_WORKER_PM2:-dntech-blog-worker}"
FRONTEND_PM2="${FRONTEND_PM2:-dntech-web}"
GIT_BRANCH="${GIT_BRANCH:-main}"
GIT_REMOTE="${GIT_REMOTE:-origin}"

DO_BACKEND=1
DO_FRONTEND=1

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

usage() {
  sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'
  exit 0
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -h | --help) usage ;;
      --skip-pull) SKIP_GIT_PULL=1 ;;
      --backend-only)
        DO_FRONTEND=0
        ;;
      --frontend-only)
        DO_BACKEND=0
        ;;
      *)
        die "unknown argument: $1 (try --help)"
        ;;
    esac
    shift
  done
}

step_git_pull() {
  if [[ "${SKIP_GIT_PULL:-}" == "1" ]]; then
    banner "Skipping git pull (SKIP_GIT_PULL=1)"
    return 0
  fi
  cd "$ROOT_DIR"

  if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    banner "Working tree has local changes (will autostash for pull):"
    git status -sb >&2 || true
  fi

  banner "git fetch ${GIT_REMOTE} && git pull --rebase --autostash ${GIT_REMOTE} ${GIT_BRANCH}"
  git fetch "$GIT_REMOTE"
  if ! git pull --rebase --autostash "$GIT_REMOTE" "$GIT_BRANCH"; then
    log ""
    log "git pull failed. On the VPS, inspect local edits:"
    log "  git status"
    log "  git diff"
    log "Then either: git stash -u && npm run update"
    log "Or discard tracked edits: git checkout -- . && git clean -fd   (careful: removes untracked files)"
    log "Or skip pull this run: SKIP_GIT_PULL=1 npm run update"
    exit 1
  fi

  banner "Now at: $(git rev-parse --short HEAD) — $(git log -1 --format='%s')"
}

step_backend_build() {
  [[ "$DO_BACKEND" == "1" ]] || return 0

  banner "Backend (./backend): npm ci"
  cd "$BACKEND_DIR"
  npm ci

  banner "Backend: npx prisma generate"
  npx prisma generate

  banner "Backend: npx prisma migrate deploy"
  npx prisma migrate deploy

  banner "Backend: npm run build"
  npm run build

  banner "Backend: pm2 restart ${BACKEND_PM2}"
  pm2 restart "$BACKEND_PM2"

  if pm2 describe "$BLOG_WORKER_PM2" >/dev/null 2>&1; then
    banner "Blog worker: pm2 restart ${BLOG_WORKER_PM2}"
    pm2 restart "$BLOG_WORKER_PM2"
  else
    log "Blog worker PM2 process '${BLOG_WORKER_PM2}' is not registered; skipping restart."
  fi
}

step_frontend_build() {
  [[ "$DO_FRONTEND" == "1" ]] || return 0

  banner "Frontend (./frontend): npm ci"
  cd "$FRONTEND_DIR"
  npm ci

  banner "Frontend: npm run build"
  npm run build

  banner "Frontend: pm2 restart ${FRONTEND_PM2}"
  pm2 restart "$FRONTEND_PM2"
}

main() {
  parse_args "$@"

  [[ -d "$BACKEND_DIR" ]] || die "backend dir not found: $BACKEND_DIR"
  [[ -d "$FRONTEND_DIR" ]] || die "frontend dir not found: $FRONTEND_DIR"

  if [[ "$DO_BACKEND" == "1" || "$DO_FRONTEND" == "1" ]]; then
    command -v pm2 >/dev/null 2>&1 || die "pm2 not found on PATH"
  fi

  step_git_pull
  step_backend_build
  step_frontend_build

  banner "Update complete (root: ${ROOT_DIR})"
  if [[ "$DO_BACKEND" == "1" ]]; then
    log "  backend  → pm2:${BACKEND_PM2}"
  fi
  if [[ "$DO_FRONTEND" == "1" ]]; then
    log "  frontend → pm2:${FRONTEND_PM2}"
  fi
}

main "$@"
