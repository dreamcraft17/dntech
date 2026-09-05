# DN Tech — Backend, Architecture & Ship-Gate Review (2026-09-05)

> **Status:** Resolved · **Last updated:** 2026-09-05 · **Author:** Dozer

## Resolution Update (2026-09-05, same day)

All 8 items in the Consolidated Action Plan were implemented as uncommitted working-tree changes. Final verification: **backend 17 suites / 102 tests passing**, `tsc` build clean; **frontend 25 suites / 98 tests passing**, `next build` clean.

| # | Item | Status | Notes |
|---|---|---|---|
| P0 | `JWT_SECRET`/`JWT_REFRESH_SECRET` fail closed in production | ✅ Done | Throws at module load if `NODE_ENV=production` and either secret is unset, before `app.listen()`. Dev/test fallback preserved. |
| P1-2 | Pagination on 8 public list endpoints | ✅ Done | `page`/`pageSize` (default 100, cap 100) added to `products`, `services`, `careers`, `faq`, `team`, `testimonials`, `branding` (values/advantages/team/stats), matching the existing `blog`/`portfolio`/`case-studies` `{data, pagination}` convention. `search.ts` was already bounded (`take: 5`/category). No frontend changes needed — callers already unwrap `.data`. |
| P1-3 | DOMPurify sanitization | ✅ Done | `isomorphic-dompurify` via new `lib/sanitize-html.ts`, wired into `privacy`, `terms`, `blog/[slug]` pages. `JsonLd.tsx` instead got a hand-rolled `escapeJsonLd()` (escapes `<`/`>`/`&`/U+2028/U+2029) since DOMPurify would corrupt JSON-LD — correct call, not a shortcut. |
| P1-4 | `npm audit fix` both sides | ✅ Done, residual documented | Backend 6→3 vulns (remaining 3 high are `deepmerge-ts` via `prisma@6.19.3`, no fixed release outside `prisma@8.x` pre-releases — correctly left alone). Frontend 10→3 (Next bumped 16.2.9→16.3.4, same major, resolved the `sharp` chain; remaining 3 moderate are `uuid` via Storybook dev-tooling only, fix would require a Storybook major downgrade — correctly left alone). |
| P2-5 | Error monitoring (Sentry) | ⚠️ Wired, needs real DSN | Both sides instrumented (`@sentry/node`, `@sentry/nextjs`), no-ops without `SENTRY_DSN` set. **You need to create a Sentry project and set `SENTRY_DSN` in production** to activate it. |
| P2-6 | Real Prisma migration history | ❌ Not done — no reachable DB | No local Postgres/Docker in the fix environment. **You must run `npx prisma migrate dev --name init` from `backend/`** against a real database yourself to baseline migrations (still outstanding from the previous fix round too). |
| P2-7 | Request-ID correlation in logs | ✅ Done | `pino-http`-based `middleware/requestLogger.ts`; reads/generates `X-Request-Id`, echoes on response, attaches `req.log` child logger. Verified live via curl to `/health`. |
| P3-8 | JWT → httpOnly cookie | ✅ Done | Backend sets `httpOnly`/`Secure`(prod)/`SameSite=Lax` cookie on login/refresh, clears on logout; auth middleware checks `Authorization: Bearer` first (legacy), falls back to cookie. Frontend now sends `credentials: 'include'` everywhere and no longer touches `localStorage` for the token. Login response body still includes the raw tokens for transition-period backward compat (documented as deprecated in code). |

**Two items need your direct action — not fixable from the repo:**
1. **Set a real `SENTRY_DSN`** (create a Sentry project, add the DSN to production env vars) to activate error monitoring.
2. **Run `npx prisma migrate dev --name init`** from `backend/` against a real Postgres to establish migration history (no DB was reachable in the fix environment).

**Manual/ops items (unchanged from the original audit, owner: Dozer):** SSL certificate validity, VPS firewall scope (80/443 only), rollback plan documentation, staging test execution, confirming production env vars are actually set on the live VPS, DB backup+restore test, confirming the production DB user's privileges.

**Not committed:** all changes are uncommitted working-tree edits — review the diff and commit when satisfied.

## Summary

This report covers three follow-up review passes on `dntech` (Next.js 16 frontend + Express 5/Prisma 6/PostgreSQL backend), run after the earlier bug-triage/QA/CTO/code-quality fixes (see `REVIEW-REPORT-2026-09-05.md`, commit `4fbbb3c`): a senior-backend API/DB/security review, a senior-architect system-shape review, and a ship-gate pre-production audit. All three are static/repo-based reviews — no live production access, no real Postgres connection, no penetration test.

**Top line:** the stack choice is validated (84% profile fit for the actual workload), architecture is clean (0 circular deps, low coupling both sides), and most security fundamentals are in place (bcrypt, rate limiting, CORS allowlist, helmet, TS strict mode). **One critical finding blocks shipping as-is:** `JWT_SECRET` silently falls back to a hardcoded default if the env var is missing in production.

---

## Table of Contents

1. [Senior Backend Review](#1-senior-backend-review)
2. [Senior Architect Review](#2-senior-architect-review)
3. [Ship Gate Report](#3-ship-gate-report)
4. [Consolidated Action Plan](#4-consolidated-action-plan)

---

## 1. Senior Backend Review

### Stack Fit (deterministic profile match)

Given this project's actual profile — small team (~3), low QPS (~5 p99), single-tenant, PII data (leads/emails), read-heavy (90/10), modular monolith preference, TypeScript — the backend decision engine scores the **current stack (Express + Prisma + PostgreSQL, modular monolith) at 84% fit**, the best-matching built-in profile. This is not a stack that needs replacing.

- Runner-up: `fastapi-python` (74%) — not relevant since the team is already TypeScript-native.
- Violated constraint: `tenancy ~ shared-multi-tenant` — expected, since this is genuinely single-tenant; not an issue.

### Findings

| # | Finding | Severity | Location |
|---|---|---|---|
| 1 | `JWT_SECRET` has a hardcoded fallback (`'dev-secret-change-me'`) instead of failing closed if the env var is unset | **Critical** | `backend/src/utils/auth.ts:5` |
| 2 | Several public list endpoints have no pagination (unbounded `findMany()`) | High | `products.ts`, `services.ts`, `careers.ts`, `faq.ts`, `team.ts`, `testimonials.ts`, `branding.ts`, `search.ts` |
| 3 | JWT stored in `localStorage`, not an httpOnly cookie | High | `frontend/src/contexts/AuthContext.tsx`, `frontend/src/lib/api.ts` |
| 4 | No sanitization library (DOMPurify or equivalent) anywhere in the repo, while 4 `dangerouslySetInnerHTML` sinks render CMS-authored content | High | `frontend/src/app/(public)/{privacy,terms,blog/[slug]}/page.tsx`, `components/seo/JsonLd.tsx` |
| ✅ | Passwords hashed with bcrypt, cost factor 12 | Pass | `backend/src/utils/auth.ts:22` |
| ✅ | JWT tokens have expiry set (`expiresIn`) on both access and refresh tokens | Pass | `backend/src/utils/auth.ts:30,39` |
| ✅ | Rate limiting present on login, forms, leads, newsletter, plus a global `/api/v1` limiter | Pass | `index.ts`, `routes/auth.ts`, `routes/forms.ts`, `routes/leads.ts`, `routes/newsletter.ts` |
| ✅ | CORS locked to an explicit origin allowlist (not wildcard), credentials handled correctly | Pass | `backend/src/index.ts:71-79` |
| ✅ | Helmet enabled with CSP defaults on | Pass | `backend/src/index.ts:68` |
| ✅ | Multer upload validates file size (5MB) and type via `fileFilter` | Pass | `backend/src/services/AdminMediaService.ts:27-28` |
| ✅ | All Prisma queries are parameterized via the ORM — no raw string-concatenated SQL found | Pass | repo-wide |
| ✅ | Auth middleware (`authenticate`, `requireRole`, `requirePermission`, `requireWrite`) consistently applied via RBAC | Pass | `backend/src/middleware/*.ts` |

### Note on findings #3/#4 combined

Individually, localStorage-stored JWTs and unsanitized `dangerouslySetInnerHTML` are each a moderate concern for a CMS-driven site (content is admin-authored, not arbitrary user input). Combined, they form one meaningful attack chain: a stored-XSS via admin-authored content (privacy/terms/blog body) would be able to read the JWT straight out of `localStorage`, since there is no httpOnly-cookie boundary protecting it. Recommend fixing at least one side of this chain — either sanitize CMS HTML before render, or move the token to an httpOnly cookie.

### Recommendations

1. **Critical:** make `JWT_SECRET` (and `JWT_REFRESH_SECRET`) required at boot — throw/`process.exit(1)` if unset when `NODE_ENV=production`, rather than silently defaulting.
2. Add `take`/`skip` pagination to the 8 listed public endpoints (default page size 20-50), matching the pattern already used correctly in `blog.ts`, `portfolio.ts`, and `case-studies.ts`.
3. Add DOMPurify (or Next.js-compatible equivalent) around every `dangerouslySetInnerHTML` call rendering stored content.
4. Consider migrating the JWT from `localStorage` to an httpOnly, `SameSite=Lax` cookie — larger change, lower priority if #3 is done first.

---

## 2. Senior Architect Review

### Detected Architecture

| Side | Pattern detected | Confidence | Notes |
|---|---|---|---|
| Backend | Layered | 25% (low confidence — tool heuristic, not a real problem) | `config`→infrastructure, `routes`→presentation, `services`→application all correctly recognized; low score is because `middleware`, `utils`, `prisma` aren't labeled in the tool's layer vocabulary — not an actual smell. |
| Frontend | Feature-based | 50% | Next.js App Router convention; expected shape for this framework. |

### Dependency Health

| Metric | Backend | Frontend |
|---|---|---|
| Circular dependencies | **0** | **0** |
| Coupling score | **22/100 (low — good)** | **0/100 (low — good)** |
| Direct dependencies | 14 | 10 |

Both sides are cleanly decoupled — no architectural red flags from the dependency graph.

### Code Organization Findings

| Finding | Severity | Note |
|---|---|---|
| `backend/src/index.ts` has 60 imports (threshold 30) | Info | Expected for an app entrypoint wiring all routes/middleware — not a real smell, just a size signal. |
| 4 "large file" warnings in `frontend/storybook-static/` | **False positive — ignore** | `storybook-static/` is a generated build artifact, confirmed gitignored (`frontend/.gitignore:17`). Not source code; the tool scanned it because it wasn't excluded from the scan path. |

### Monolith vs. Microservices Decision

Per the standard decision workflow: team size 3, single deployment unit, shared Postgres DB, unclear need for independent per-service scaling → **modular monolith is correct**, matching what's already built. Microservices would add operational overhead (service discovery, distributed tracing, multiple deploy pipelines) with no corresponding benefit at this team size or traffic level. **No architectural rewrite is warranted.**

### Deployment Topology

Local: Docker Compose (db + backend + frontend, 3 services). Production: PM2 + Nginx on a VPS, not containerized in prod. This split (Docker locally, PM2 on VPS) is a reasonable and common pattern for a small team, though it does mean the local dev environment and production environment aren't identical — worth keeping in mind as a source of "works in Docker, breaks on VPS" class bugs (this is exactly the class of bug the recurring SSR production-only fixes, flagged in the prior review, fall into).

### Recommendations

1. No architecture change needed — the modular monolith is validated both by the backend decision engine (84% fit) and the architect's own decision workflow.
2. Treat the Docker-local vs. PM2-VPS split as a known environment-parity risk; the CI SSR smoke-test stage added in the previous fix round directly mitigates this.
3. Scope future `project_architect.py` runs to `src/` only (or add `storybook-static` to the tool's exclude list) to avoid false-positive noise from build artifacts.

---

## 3. Ship Gate Report

**Stack:** Next.js 16 + Express 5/Prisma 6 + PostgreSQL, Docker Compose (local) / PM2+Nginx (VPS). AI/LLM category: SKIP (no LLM usage in this repo).

```
[1/8] Security:      2 FAIL, 14 PASS, 2 SKIP
[2/8] Database:      1 FAIL, 3 PASS, 8 MANUAL
[3/8] Deployment:    0 FAIL, 2 PASS, 11 MANUAL
[4/8] Code Quality:  1 FAIL, 12 PASS, 1 SKIP
[5/8] AI/LLM:        8 SKIP
[6/8] Dependencies:  2 FAIL, 5 PASS
[7/8] Frontend:      0 FAIL, 8 PASS, 2 SKIP
[8/8] Observability: 1 FAIL, 1 PASS, 5 MANUAL
```

### CRITICAL (1 — must fix before shipping)

| Check | Finding |
|---|---|
| SEC-12 / DEPLOY-01 | `JWT_SECRET` falls back to the hardcoded string `'dev-secret-change-me'` (`backend/src/utils/auth.ts:5`) if the env var is unset in production — the app boots silently with a publicly-known secret instead of failing closed. Same root cause as Senior Backend finding #1. |

### HIGH (5 — should fix before shipping)

| Check | Finding |
|---|---|
| SEC-14 | JWT in `localStorage` + 4 unsanitized `dangerouslySetInnerHTML` sinks (no DOMPurify anywhere in repo) — stored-XSS in admin content could steal tokens. |
| DB-06 | No `prisma/migrations/` directory — project uses `prisma db push`, so schema changes have no versioned history or rollback path. |
| CODE-05 | 8 public endpoints with no pagination (same list as Senior Backend finding #2). |
| DEP-04 | `npm audit`: backend 4 vulns (1 moderate `qs`, 3 high via `prisma` dev-dependency chain); frontend 4 high (`sharp`/libvips via Next's image pipeline — full fix requires bumping to `next@16.3.4`). |
| OBS-01 | No error monitoring (Sentry or equivalent) configured on either side. |

### ADVISORY (1)

| Check | Finding |
|---|---|
| OBS-03 | Structured logging (pino, added in the previous fix round) has no request-ID correlation — can't trace a single request across log lines yet. |

### PASS highlights

bcrypt cost-12 hashing · JWT expiry set · rate limiting on all sensitive endpoints · CORS locked to explicit allowlist · helmet + CSP defaults · TypeScript strict mode both sides · lockfiles committed, no wildcard dependency versions · no empty catch blocks · `/health` endpoint present · multer upload validates size+type · Prisma parameterized queries throughout · `.env*` correctly gitignored and never committed to git history · meta tags, favicon, custom 404 (`not-found.tsx`), `robots.ts`/`sitemap.ts` all present.

### MANUAL (needs direct confirmation — not auto-checkable from the repo)

SSL certificate validity · VPS firewall scoped to 80/443 only · rollback plan documented · staging test passed before production · all env vars actually set on the live VPS · DB backup **and restore** tested (not just backup) · non-root DB user on the real production database (docker-compose reflects local dev only, not the actual VPS Postgres setup).

### VERDICT: **DO NOT SHIP** (1 critical)

Fixing the `JWT_SECRET` fail-closed check moves this to **SHIP WITH CAUTION** — the remaining 5 high items are reasonable to fix quickly or explicitly accept for a low-traffic marketing/CMS site.

---

## 4. Consolidated Action Plan

| Priority | Action | Source |
|---|---|---|
| **P0 — blocks shipping** | Make `JWT_SECRET`/`JWT_REFRESH_SECRET` required at boot in production (fail closed, don't default) | Senior Backend, Ship Gate |
| P1 | Add pagination (`take`/`skip`) to the 8 unbounded public list endpoints | Senior Backend, Ship Gate |
| P1 | Add DOMPurify sanitization around all 4 `dangerouslySetInnerHTML` sinks | Senior Backend, Ship Gate |
| P1 | Run `npm audit fix` on both backend and frontend; evaluate the Next.js minor bump needed to fully clear the `sharp` advisory | Ship Gate |
| P2 | Configure error monitoring (Sentry free tier is sufficient at this scale) | Ship Gate |
| P2 | Establish a real Prisma migration history (`prisma migrate`) instead of relying solely on `db push`, so schema changes are versioned and reversible | Ship Gate |
| P2 | Add request-ID correlation to the pino logger | Ship Gate |
| P3 | Consider moving the JWT from `localStorage` to an httpOnly cookie (larger change; do after P1 sanitization fix) | Senior Backend |
| Manual (owner: Dozer) | Confirm SSL, VPS firewall, rollback plan, staging test, live env vars, DB backup+restore test, and production DB user privileges | Ship Gate |

---

*This report is based on static repository inspection only — no live production access, real Postgres connection, or penetration test was performed. Architecture and stack-fit conclusions used the deterministic (non-LLM) `backend_decision_engine.py` and `project_architect.py`/`dependency_analyzer.py` tools bundled with the respective skills.*
