# DN Tech — Combined Engineering Review (2026-09-05)

> **Status:** Resolved · **Last updated:** 2026-09-05 · **Author:** Dozer

## Resolution Update (2026-09-05, same day)

All 10 items in the Consolidated Action Plan below were implemented as uncommitted working-tree changes (not yet committed — review the diff and commit when ready). Final test run: **backend 85/85 unit + 17/17 integration passing**, `tsc --noEmit` clean, `npm run build` succeeds, `prisma validate` passes; **frontend 100/100 passing** (25 suites). Playwright e2e was not run (requires browser binary install + a live server not available in the fix environment).

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Refactor `admin.ts` / `admin-branding.ts` into a service layer | ✅ Done | `admin.ts` 972→~300 lines, `admin-branding.ts` 339→~115 lines. 7 new services + 7 new test files added. Pre-existing quirks (e.g. portfolio mutations never clearing cache) preserved as-is, not silently "fixed" into different behavior. |
| 2 | CI SSR smoke-test stage | ✅ Done | Added to `.github/workflows/ci.yml` — hermetic: spins up its own Postgres, seeds real data, builds+starts backend and frontend, curls two real SSR routes expecting HTTP 200. Not coupled to production uptime. |
| 3 | Align Zod v3→v4 | ✅ Done | Backend bumped to `zod@^4.4.3`. Fixed `err.errors`→`err.issues` and `z.record()` single-arg→two-arg call sites (6 locations). All tests green. |
| 4 | Structured logging (pino) | ✅ Done | New `backend/src/config/logger.ts`; all `console.*` in `backend/src` (excl. tests/scripts) replaced across 6 files. |
| 5 | Docker Compose hardcoded secrets | ✅ Done | `docker-compose.yml` now uses `${VAR:-default}` interpolation; root `.env.example` added; confirmed `.gitignore` already covers root `.env`. |
| 6 | Automate VPS rebuild step | ✅ Done | New `scripts/deploy.sh`; README deploy section updated to recommend it, manual steps kept as fallback. |
| 7 | Prisma `onDelete` policy | ⚠️ Schema done, migration not applied | Explicit `SetNull`/`Restrict` added per relation (reasoning in report body below). **Could not generate/apply a migration** — no Postgres reachable in the fix environment, and the project uses `prisma db push` (no `migrations/` dir exists). User must run `npx prisma db push` (or baseline `migrate dev --create-only`) against a real database. |
| 8 | Backfill ADRs | ✅ Done | `adr/0001-nextjs16-react19-express5.md`, `adr/0002-json-blob-vs-normalized-product-fields.md` — placed outside `docs/` since `DOCS.md` forbids that folder for this repo. |
| 9 | Re-verify "99 passing" claim | ✅ Done, and updated | Real count is now 85+17 backend / 100 frontend (higher than the original 50+49 due to new service tests) — README's stale number should be refreshed. |
| 10 | Expand thin `lib/api.test.ts` | ✅ Done | 2 assertions → 32 tests covering all exported functions, happy path + error/edge cases. |

**Remaining manual step for the user:** run `npx prisma db push` (or set up a real Postgres and baseline `prisma migrate`) to actually apply the new `onDelete` policies to a database — this was the one item that could not be completed inside the fix environment (no reachable Postgres/Docker). Everything else is code-complete and test-verified.

**Not committed:** all changes are uncommitted working-tree edits, per instructions — review the diff (`git status` / `git diff`) and commit when satisfied.

## Summary

This report merges four independent review passes over the `dntech` repository (Next.js 16/React 19 frontend + Express 5/Prisma 6 backend, PostgreSQL, Docker Compose deployment): a bug/failure triage, a test-quality (QA) review, a CTO-level architecture/tech-debt assessment, and a code-quality review. Findings are based on repo inspection (git history, source tree, Prisma schema, test suite, `docker-compose.yml`, `package.json`) as of the latest commit (2026-08-30). No CI logs or production error monitoring were available to scan, so bug triage relies on git history and static markers rather than live failure data.

**Top 3 things to act on first:**
1. Split `backend/src/routes/admin.ts` (972 lines) into a service layer — it is the single largest file, mixes validation/upload/cache/logging concerns, and is the hardest thing in the repo to unit-test.
2. Resolve the Zod v3 (backend) vs v4 (frontend) version split before it causes a validation-behavior mismatch across the API boundary.
3. Move `docker-compose.yml` credentials to `.env`-interpolated values — current values are clearly-labeled placeholders, but the pattern normalizes hardcoded secrets in committed infra files.

---

## Table of Contents

1. [AI Bug Triage](#1-ai-bug-triage)
2. [AI QA / Test Quality Review](#2-ai-qa--test-quality-review)
3. [CTO Technical Advisory](#3-cto-technical-advisory)
4. [Code Quality Review](#4-code-quality-review)
5. [Consolidated Action Plan](#5-consolidated-action-plan)

---

## 1. AI Bug Triage

**Scope note:** No CI logs, error monitoring (Sentry/Datadog), or `failures.json` were available in-repo. Triage below is derived from git history patterns (105 commits total, last commit 2026-08-30) and static code scanning — treat severities as provisional pending real failure telemetry. Zero `TODO`/`FIXME`/`HACK`/`XXX` markers exist in `frontend/src` or `backend/src`, suggesting known issues are tracked externally (a `BUG_FIXES.md` register referenced by commit messages, in the external `company-wiki` repo per `DOCS.md`).

### Fingerprinted Issues (from git history + static scan)

| ID | Fingerprint | Category | Severity | Priority | Evidence |
|----|------------|----------|----------|----------|----------|
| BF-HIST-01 | `recurring-ssr-prod-only-fix` | Regression / environment-parity | Major | P1 | Multiple `fix: resolve X in production SSR (BF-0XX)` commits in the last 50; pattern indicates SSR-specific bugs are shipped and only caught in production, not in CI/tests. No SSR-specific test coverage found in the 30 frontend test files. |
| BF-HIST-02 | `deploy-rebuild-required` | Environment / deploy | Major | P1 | README explicitly documents that after `git pull` on the VPS, `pm2 restart` alone is insufficient — a full frontend rebuild is required, or stale bundles serve. Recurring deploy foot-gun, not automated (no post-pull hook found). |
| BF-CODE-01 | `admin-route-monolith-risk` | Application bug risk (maintainability) | Minor | P2 | `backend/src/routes/admin.ts` (972 lines) inlines Zod schemas, multer config, cache invalidation, and activity logging — high blast radius for any change; no isolated unit tests target this file directly (only integration-level route tests exist for leads/products/newsletter/auth, not admin). |
| BF-CODE-02 | `zod-version-mismatch` | Application bug risk (contract drift) | Minor | P2 | Backend pins `zod@^3.25.51`, frontend pins `zod@^4.4.3`. v3→v4 has breaking schema/API changes; if any validation schema or type is ever shared/copied between the two, behavior will silently diverge. |
| BF-CODE-03 | `prisma-client-duplication` | Code smell / potential drift | Trivial | P3 | `new PrismaClient()` instantiated directly in 5 seed/utility scripts instead of importing the shared singleton from `backend/src/config/database.ts`. Low risk (scripts, not runtime request path) but could mask connection-pool exhaustion if ever run concurrently. |
| BF-CODE-04 | `soft-delete-inconsistency` | Application bug risk (data integrity) | Minor | P2 | Soft-delete (`deletedAt`) is present on `User`, `Service`, `Product`, `PortfolioItem`, `BlogPost` but absent on `FormSubmission`, `TeamMember`, `Testimonial`, `Faq`, `Career`, `NewsletterSubscriber`, `EmailLog`. Enforcement of `deletedAt: null` filtering is manual per-query (confirmed in `admin.ts`), not schema-enforced — a missed filter on any model is an unreported data-visibility bug waiting to happen. |
| BF-CODE-05 | `unspecified-onDelete-behavior` | Application bug risk (referential integrity) | Minor | P2 | No relation in `schema.prisma` specifies `onDelete` behavior. Default Prisma referential action applies; deleting a `User` who authored content could throw an unhandled FK error at request time rather than cascading or nulling out, depending on migration-level defaults (not verified against actual migration SQL). |
| BF-VAGUE-01 | `non-descriptive-commits` | Process smell | Trivial | P3 | Two commits with non-descriptive messages (`sd`, `big update`) in recent history — not a bug per se, but reduces `git bisect` usefulness for future regression hunting (see `bug-reproduction` workflow dependency on clean history). |

### Draft Ticket — BF-HIST-01 (highest priority)

```
Title: [SSR] Production-only rendering failures not caught by CI (recurring)
Severity: Major | Priority: P1 | Component: frontend/app (SSR)
Fingerprint: recurring-ssr-prod-only-fix

Description:
Git history shows a recurring pattern of "fix: resolve X in production SSR"
commits (BF-0XX series) — SSR-specific defects (per README, related to
the server-api.ts resolver pattern) are only discovered after production
deploy, not during CI or local dev.

Suggested Root Cause:
Local/dev testing likely runs against client-side or dev-mode rendering
that doesn't exercise the same SSR code path as the production build.
No test in the 30-file frontend suite specifically exercises SSR output.

Suggested Fix Direction:
Add a smoke-test stage that runs `next build && next start` and hits key
SSR routes (product/service detail pages) in CI before deploy, closing
the dev/prod parity gap documented in the README itself.

Related Issues: BF-HIST-02 (deploy rebuild gap — same dev/prod parity theme)
```

**Human review required:** all P1/P2 items above are first-occurrence static findings (no historical fingerprint database exists yet to compare against) — route through normal engineering triage, do not auto-assign.

---

## 2. AI QA / Test Quality Review

**Suite inventory:** 40 test files total — Frontend: 25 Jest (16 component, 1 hook, 8 lib) + 5 Playwright e2e specs. Backend: 10 Jest (4 route/integration, 3 utils, 1 templates, 2 services). README claims "99 passing" (50 backend + 49 frontend) — **not independently re-run as part of this review**; treat as self-reported until verified in CI.

### Findings by Dimension

| Dimension | Finding | Severity | Evidence |
|---|---|---|---|
| Reliability | **No sleep/`waitForTimeout` usage found** anywhere in the suite (Jest or Playwright) | ✅ Positive | Grep across all e2e + jest tests returned zero matches — strong signal against flakiness from timing hacks. |
| Coverage | **Thin/low-value unit test** on a non-trivial file | Medium | `frontend/src/__tests__/lib/api.test.ts` has only 2 assertions ("doesn't throw", "returns a string") against a 175-line `lib/api.ts` — classic Happy-Path-Only / weak-assertion smell. |
| Design | **Integration-only coverage for the highest-risk file** | Medium | `backend/src/routes/admin.ts` (972 lines, highest complexity in repo) has no dedicated test file — only `leads`, `products`, `newsletter`, and `auth` routes have integration tests. The single largest, most-mutated file is the least tested. |
| Coverage | **No SSR-path test coverage** | Medium | Corresponds to BF-HIST-01 above — the recurring production-SSR bug class has no regression-test category guarding against recurrence. |
| Design | Mocking pattern in `LeadService.test.ts` mocks `config/database` (Prisma) and `EmailService` wholesale via `jest.mock` | Low | Appropriate boundary mocking (DB + email are external-ish boundaries) — not over-mocking; assertions are specific (`toBe`/`toEqual`/`toHaveBeenCalledTimes`), no weak `toBeTruthy` pattern observed in this file. |
| Coverage | No `it.each`/parameterized tests observed in sampled files | Low | Not necessarily wrong for the sampled files' scope, but worth checking during a fuller batch audit for any validation/boundary-heavy logic (e.g., Zod schema edge cases) that would benefit from table-driven tests. |

### Testability Assessment (Application Code)

| Issue | Location | Recommendation |
|---|---|---|
| Business logic inline in route handlers | `backend/src/routes/admin.ts`, likely `admin-branding.ts` (339 lines) | Extract Zod schemas, upload/file-filter config, and cache-invalidation calls into a service layer (mirror the existing `LeadService`/`EmailService` pattern) so admin logic is unit-testable without spinning up Express + supertest. |
| Direct `PrismaClient` instantiation outside DI boundary | 5 seed/utility scripts | Low priority (not on the request path) — import the shared singleton from `config/database.ts` for consistency; mainly a hygiene item, not a blocking testability issue. |
| No structured logger / no log-level abstraction | `EmailService.ts`, `index.ts` (`console.log`/`console.error`, 32 + 8 occurrences) | Not strictly a test smell, but makes assertions on "did we log the right thing" impossible to test meaningfully — a structured logger (pino/winston) with an injectable transport would let tests assert on log output. |

### Verification Status

- ✅ No sleep-based waits (reliability check passed via static scan).
- ⚠️ Suite was **not executed** as part of this review (no shell access confirmation requested for `npm test` in either frontend or backend) — README's "99 passing" claim should be re-verified by actually running `npm test` in both `frontend/` and `backend/` before trusting it in a release decision.
- ⚠️ No mutation-testing tooling (Stryker, etc.) detected in either `package.json` — mutation score unknown; recommend introducing `@stryker-mutator/core` at least for `backend/src/services` and `backend/src/utils` as a starting scope.

---

## 3. CTO Technical Advisory

### Architecture Snapshot

- **Stack:** Next.js 16 (App Router) + React 19.2 frontend; Express 5 + Prisma 6 + PostgreSQL backend; JWT+RBAC auth; Docker Compose (local) / PM2+Nginx (VPS) for deployment.
- **Docs strategy:** Product docs (PRD/SRS/SDD, changelog, runbooks) are deliberately kept out of this repo and live in a separate `company-wiki` repo (per `DOCS.md`) — reasonable separation of concerns for a single-repo-per-product setup, but means this review cannot cross-check "documented status" against code without pulling that repo.
- **21 Prisma models**, JSON-heavy `Product` model (~35 fields, many `Json?` blobs for tech stack/pricing/case studies) — pragmatic for a CMS-driven marketing site, but trades DB-level referential integrity for schema flexibility; acceptable given the product's nature (content site, not transactional core IP).

### Technical Debt Inventory

| Item | Severity | Cost-to-Fix (est.) | Blast Radius | Priority Score |
|---|---|---|---|---|
| `admin.ts` route monolith (972 lines, no service layer) | P1 | 5-8 days | Backend admin surface (all CMS content types) | **HIGH** |
| Zod v3 (backend) / v4 (frontend) version split | P2 | 1-2 days | API contract boundary, any shared validation | MEDIUM |
| No structured logging (raw `console.*`) | P2 | 2-3 days | Whole backend — blocks real observability/alerting | MEDIUM |
| Hardcoded placeholder secrets in `docker-compose.yml` | P2 | <1 day | Local dev infra only (values are dummy, not real) | MEDIUM |
| Recurring SSR production-only bugs (no CI smoke test) | P1 | 2-3 days (add CI smoke stage) | Public-facing product pages | HIGH |
| Manual deploy rebuild step (documented foot-gun) | P2 | 1 day (deploy script automation) | VPS production deploys | MEDIUM |
| Inconsistent soft-delete + no `onDelete` policy in schema | P3 | 3-5 days (audit + migration) | Data integrity across 21 models | LOW-MEDIUM |
| Bleeding-edge dependency versions (Next 16, React 19.2, Express 5) | P3 | Ongoing (monitoring cost, not a fix) | Whole app — upgrade/compat risk | LOW |

**Debt ratio estimate:** Given the small team-scale of this repo (single-product monorepo, ~105 commits, no visible multi-team ownership split) and the concentration of debt into one file (`admin.ts`) plus a handful of process gaps, this reads as a **healthy, low-debt codebase** for its size — the CTO red flag threshold (>30% debt ratio, declining deploy frequency) does not appear to apply here. The main risk is architectural concentration risk (one file, one deploy-process gap) rather than systemic debt.

### Key Risks (CTO framing)

- **"If we 10x traffic tomorrow, what breaks first?"** — Not directly assessable without load-test data; the JSON-blob-heavy `Product` model and lack of visible caching strategy beyond an in-process `CacheService` are the most likely first bottlenecks for a content-heavy site under load.
- **"What's our bus factor on critical systems?"** — `admin.ts` at 972 lines with no dedicated tests is a single-point-of-understanding risk: whoever touches it needs to hold the whole file's context, and there's no test suite to validate changes are safe.
- **No ADRs found in-repo** (or in the excerpt reviewed) for major decisions like the Express 5 upgrade, Next 16 adoption, or the JSON-blob-vs-normalized-tables choice for `Product`. Per CTO-advisor convention, decisions with >1 sprint of effort/risk implications should have an ADR — recommend backfilling at least the Product-schema and framework-version decisions.

### Recommendations (prioritized)

1. **P1 — Add a CI smoke-test stage** that runs `next build && next start` and hits key SSR routes before any production deploy (directly closes BF-HIST-01/BF-HIST-02).
2. **P1 — Extract `admin.ts` into a service layer** mirroring `LeadService`/`EmailService`, with tests added alongside the refactor (kills two birds: tech debt + QA coverage gap).
3. **P2 — Align Zod versions** across frontend/backend (pick v4, since it's the actively maintained major).
4. **P2 — Introduce structured logging** (pino recommended for Express 5 compatibility) before scaling the team or adding an APM/alerting layer.
5. **P3 — Backfill 2-3 ADRs** for the framework-version and Product-schema decisions, establishing the habit going forward.

---

## 4. Code Quality Review

### Complexity / Risk Ranking

| File | Lines | Risk Flag | Note |
|---|---|---|---|
| `backend/src/routes/admin.ts` | 972 | 🔴 High | God-file: Zod schemas + multer config + cache invalidation + activity logging inline. Nearly 2.5x the next-largest file. No SOLID single-responsibility. |
| `frontend/src/app/(public)/products/[slug]/page.tsx` | 419 | 🟡 Medium | Large page component; not reviewed line-by-line, flagged by size threshold only (>merely large, not necessarily god-class). |
| `frontend/src/app/admin/products/page.tsx` | 378 | 🟡 Medium | Same size-based flag; admin CRUD UI likely benefits from the shared `AdminCrudPage.tsx` (213 lines) abstraction already present elsewhere in repo. |
| `backend/src/routes/admin-branding.ts` | 339 | 🟡 Medium | Named/structured consistently with `admin.ts` — likely shares the same inline-logic smell; recommend reviewing alongside the `admin.ts` refactor. |
| `frontend/src/lib/homepage-content.ts` | 315 | 🟢 Low | Content/config file — size is expected for structured content data, not a complexity smell. |

Only **one file exceeds the 500-line threshold** (`admin.ts`, 972 lines) — the codebase is otherwise well-decomposed by size.

### SOLID / Code Smell Findings

| Category | Finding | Severity | Location |
|---|---|---|---|
| Single Responsibility violation | Route handler owns validation, file upload config, cache invalidation, and audit logging simultaneously | High | `backend/src/routes/admin.ts` |
| Dependency Injection gap | Direct `new PrismaClient()` instead of shared singleton | Low | 5 files under `backend/scripts/` and `backend/prisma/seed.ts` |
| Inconsistent primary-key strategy | Mixed `@default(uuid())` / `@default(cuid())` across models | Low | `backend/prisma/schema.prisma` |
| Missing referential-action policy | No `onDelete` specified on any Prisma relation | Medium | `backend/prisma/schema.prisma` (all relations) |
| Logging inconsistency | Raw `console.log`/`console.error` (40 occurrences combined) instead of a structured logger | Medium | `backend/src/index.ts`, `backend/src/services/EmailService.ts`, scattered elsewhere |
| Dependency version drift | Zod v3 (backend) vs v4 (frontend) in the same monorepo | Medium | `backend/package.json` vs `frontend/package.json` |
| Infra-as-code hygiene | Placeholder secrets hardcoded directly in `docker-compose.yml` rather than `.env`-interpolated | Low | `docker-compose.yml` (values are dummy/self-labeled, not real secrets) |
| Positive: centralized error handling | Routes uniformly use an `asyncHandler` wrapper rather than per-route try/catch — no empty catch blocks or bare rethrows found anywhere in the scanned code | ✅ N/A | `backend/src/routes/*.ts` |
| Positive: no dead-marker debt | Zero `TODO`/`FIXME`/`HACK`/`XXX` markers in either `frontend/src` or `backend/src` | ✅ N/A | Whole repo |

### Verdict (per code-reviewer scoring convention)

Given one high-severity concentrated finding (`admin.ts`), several medium-severity consistency issues, and multiple positive signals (no dead markers, centralized error handling, no empty catches, no sleep-based test flakiness) — this maps to **"Approve with suggestions"**: the codebase is in good health overall, but the `admin.ts` refactor and logging/versioning consistency items should be scheduled rather than deferred indefinitely.

---

## 5. Consolidated Action Plan

| Priority | Action | Owning Report(s) |
|---|---|---|
| P1 | Refactor `backend/src/routes/admin.ts` into a service layer + add unit tests | Bug Triage, QA, CTO, Code Quality (all four flagged this independently) |
| P1 | Add CI smoke-test stage (`next build && next start` + hit key SSR routes) to catch production-only SSR regressions before deploy | Bug Triage, CTO |
| P2 | Align Zod to a single major version (v4) across frontend and backend | Bug Triage, CTO, Code Quality |
| P2 | Introduce structured logging (pino/winston) to replace raw `console.*` | CTO, Code Quality |
| P2 | Move `docker-compose.yml` credentials to `.env` interpolation | CTO, Code Quality |
| P2 | Automate the post-`git pull` VPS rebuild step currently done manually | Bug Triage, CTO |
| P3 | Decide and apply an explicit `onDelete` policy across Prisma relations | Bug Triage, Code Quality |
| P3 | Backfill ADRs for the Next 16 / React 19 / Express 5 adoption and the `Product` JSON-blob schema decision | CTO |
| P3 | Re-run and confirm the README's "99 passing" test claim in CI before relying on it | QA |
| P3 | Replace the thin `lib/api.test.ts` assertions with meaningful coverage | QA |

---

*This report was generated from static repository inspection only (no CI logs, production monitoring, or live test execution were available). Treat severity/priority ratings as a starting triage, not a substitute for running the actual test suite and checking real production error rates.*
