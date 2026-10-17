# Ship Gate Report — dntech (2026-10-18)

> **Status:** Remediated · **Last updated:** 2026-10-18 · **Author:** Dozer

## Summary

Full-project ship-gate audit of `dntech` (backend: Express 5 + Prisma/PostgreSQL + JWT auth; frontend: Next.js 16 App Router) covering security, database, deployment, code quality, AI/LLM usage, dependencies, frontend quality, and observability. Scan found **4 critical** and **6 high** issues that should block shipping, plus 5 advisory items. A solid security baseline is already in place (see Pass section).

## Remediation status (2026-10-18)

All 4 critical and all 6 high findings are fixed, plus 2 of the 5 advisory items (the other 3 are dev-tooling-only CVEs, not runtime-reachable). Tested (231 backend / 139 frontend tests pass) and pushed to `main`:

- `0c5df26` — HIGH: dependency bumps, Dockerfiles run as non-root on Node 22, docker-compose fails fast on missing secrets instead of using weak defaults
- `c2b351b` — CRITICAL: revalidate-secret leak closed, proxy-addr/Next.js CVEs patched, real Prisma migration baseline established
- `5d0ab8d` — HIGH #10: lead/newsletter/quiz contact PII (email, phone) encrypted at rest
- (this change) — ADVISORY: dompurify bumped to 3.4.17, `requirePermission('leads:view')` made explicit on the leads admin routes

**Two manual one-time steps are required before/at the next deploy** — see `docs/runbooks/PRISMA-MIGRATIONS-BASELINE.md` and `docs/runbooks/PII-FIELD-ENCRYPTION.md`: run `prisma migrate resolve --applied 20261017195846_baseline` against any existing database, set `ENCRYPTION_KEY` and `REVALIDATE_SECRET` in production env, and run `npm run db:backfill-pii-encryption` once after deploying.

**Original verdict (superseded below):** DO NOT SHIP until the 4 critical items are fixed — in particular #1, which is an actively exploitable live security bug if the current code is already deployed.

## Stack Summary

| Layer | Stack |
|---|---|
| Backend | Express 5, Prisma ORM, PostgreSQL, JWT auth (bcrypt + jsonwebtoken), Sentry |
| Frontend | Next.js 16.3.4 (App Router), TypeScript strict mode, Tailwind, Sentry |
| AI | Gemini-backed chatbot (`dnMate`), server-side only |
| Infra | Docker Compose, Dockerfiles for backend + frontend |

## Critical Findings (must fix before shipping)

1. ✅ **FIXED** (`c2b351b`) — **`NEXT_PUBLIC_REVALIDATE_SECRET` leaks the `/api/revalidate` secret into the public frontend JS bundle.**
   `frontend/src/app/(admin)/admin/settings/page.tsx:105` and `frontend/src/app/(admin)/admin/products/page.tsx:17` read `process.env.NEXT_PUBLIC_REVALIDATE_SECRET` to call `POST /api/revalidate` (`frontend/src/app/api/revalidate/route.ts`), which checks the `x-revalidate-secret` header against `REVALIDATE_SECRET`. Because of the `NEXT_PUBLIC_` prefix, the secret value is baked into the public JS bundle — anyone can extract it via DevTools/view-source and call the revalidate endpoint at will, with arbitrary `paths`. This fully defeats the endpoint's intended protection.
   **Fix:** move the revalidate call behind a server-side route/server action that reads a non-public secret; never expose an auth secret via `NEXT_PUBLIC_*`.

2. ✅ **FIXED** (`c2b351b`) — **`proxy-addr@2.0.7` — critical IP spoofing vulnerability** ([GHSA-jqcg-44mw-7w3h](https://github.com/advisories/GHSA-jqcg-44mw-7w3h)), a runtime dependency of Express 5's `trust proxy` config used for rate-limiting and IP logging.
   **Fix:** update Express/proxy-addr to a patched version.

3. ✅ **FIXED** (`c2b351b`, bumped to 16.4.2) — **Next.js `16.3.4` is in the critical vulnerable range (16.0.0–16.3.7):** SSRF in Image Optimization (reachable — `next/image` used in 14 files), RCE in `next/og` `ImageResponse` (not used in this project, lower risk), plus several moderate cache-poisoning/information-disclosure issues.
   **Fix:** `npm install next@latest` in `frontend/` to a patched 16.x release.

4. ✅ **FIXED** (`c2b351b`) — **`backend/Dockerfile` runs `prisma db push && tsx prisma/seed.ts` on every container start in production**, and **no `prisma/migrations` directory exists at all** — there is no versioned, rollback-able schema history. `db push` is destructive/non-transactional against the live schema, and re-running the seed script on every restart risks re-seeding admin data.
   **Fix:** separate migrate/seed from the container start command; adopt `prisma migrate deploy` with committed migration files; run seeding manually/one-off only.
   **Note:** the real production deploy path turned out to be `scripts/deploy.sh` (PM2 on a VPS), not Docker — it ran `prisma db push --skip-generate` on every deploy and was fixed the same way. A baseline migration (`20261017195846_baseline`) was generated and verified against a disposable local Postgres (zero drift, seed runs cleanly). See `docs/runbooks/PRISMA-MIGRATIONS-BASELINE.md` for the required one-time step on existing databases.

## High Findings (should fix before shipping)

5. ✅ **FIXED** (`0c5df26`) — **`compression@1.8.1`** — vulnerable (`<1.8.2`) to DoS via memory leak on premature response close ([GHSA-vc2v-76pw-4v95](https://github.com/advisories/GHSA-vc2v-76pw-4v95)), used directly in `backend/src/index.ts`.
6. ✅ **FIXED** (`0c5df26`, bumped to 10.1.2) — **`nodemailer@9.0.3`** — vulnerable (`<=10.0.5`) to DoS via `addressparser` backtracking, used in `backend/src/services/EmailService.ts` for leads/newsletter email delivery.
7. ✅ **FIXED** (`0c5df26`, override to 0.35.5) — **`sharp@0.35.4`** (Next.js image optimization dependency) — vulnerable to a librsvg CVE ([GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w)).
8. ✅ **FIXED** (`0c5df26`) — **Both `backend/Dockerfile` and `frontend/Dockerfile` run as root** — no `USER` directive in either image.
9. ✅ **FIXED** (`0c5df26`) — **`docker-compose.yml` ships weak default fallback secrets:** `POSTGRES_PASSWORD:-dntech123`, `JWT_SECRET:-change-this-in-production-use-long-random-string`, `ADMIN_PASSWORD:-DevOnly-LocalBootstrap-ChangeMe!`. The backend app itself refuses to boot without `JWT_SECRET` in production (good), but the **Postgres container has no equivalent guard** — if the env var is ever missing at deploy time, the database starts with a public, well-known default password.
10. ✅ **FIXED** (`5d0ab8d`) — **PII (email, phone, address) is stored as plaintext** across `User`, leads, and `SiteSettings` models with no column-level encryption.
    **Scope actually implemented:** leads/newsletter/quiz contact PII (email, phone) only — see `docs/runbooks/PII-FIELD-ENCRYPTION.md` for why `User.email` (internal staff accounts) and `SiteSettings`/`TeamMember` (already-public business info) were deliberately left out of scope, and the one-time backfill step required for existing data.

## Advisory (not blocking)

- `handlebars@4.7.9` has a critical CVE but is only pulled in via `ts-jest` (dev/test-only, not runtime-reachable).
- `source-map-js` and `uuid@9.0.1` (via Storybook) are vulnerable but are dev-tooling-only, not part of the production build.
- ✅ **FIXED** (2026-10-18, bumped to 3.4.17 via `npm update dompurify`) — `dompurify@3.4.14` had a low-severity XSS-hook issue; used for HTML sanitization (`isomorphic-dompurify`).
- ~~No `robots.txt`/`sitemap` was found in a quick scan~~ — **correction:** both exist, generated dynamically via `app/robots.ts`/`app/sitemap.ts` (confirmed present in the `next build` route list). The original finding was a false negative from a static-file grep.
- ✅ **FIXED** (2026-10-18) — `GET /admin/leads`, `GET /admin/leads/:id`, and `POST /admin/leads/export` now carry an explicit `requirePermission('leads:view')` instead of relying on the base `authenticate` only. No access change (every role already had `leads:view`) — just makes the authorization enforced at the route instead of implicit.

## Pass (already solid)

- Helmet + CORS allowlist with an origin validator (no wildcard CORS)
- Per-route rate limiting (chat: 20/min, general API: 100/min)
- bcrypt password hashing at cost factor 12
- JWT expiry configured; app refuses to boot without secrets set in production
- httpOnly / secure / sameSite cookies for auth
- Zod validation on checked endpoints
- Generic error responses — no leaked stack traces to clients
- Structured logging via pino
- Sentry configured on both frontend and backend
- File uploads validated: MIME-type allowlist, size limit, UUID filenames (no path traversal)
- Chatbot keeps the system prompt separate from user content and explicitly refuses to leak it
- `.env` files have never been committed to git history
- TypeScript strict mode enabled

## Verdict

**CLEAR TO SHIP**, conditional on completing the two manual one-time steps before/at the next deploy (migration baseline resolve + PII backfill — see links above) and setting `ENCRYPTION_KEY`/`REVALIDATE_SECRET` in the production environment. All 10 critical/high findings are fixed and tested; no blocking items remain.
