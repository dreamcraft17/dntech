# PII field encryption (2026-10-18)

> **Author:** Dozer · **Date:** 2026-10-18 · **Status:** Active

## What this is

`email`/`phone` on `FormSubmission` (leads/contact/service-request/career
forms), `NewsletterSubscriber`, and `QuizSubmission` are now encrypted at
rest with AES-256-GCM (`backend/src/utils/encryption.ts`), in response to a
HIGH finding in `SHIP-GATE-REPORT-2026-10-18.md` (customer contact PII
stored as plaintext).

**Deliberately out of scope:**
- `User.email` — internal staff/admin accounts (SuperAdmin/ContentManager/
  Editor/Viewer), not customer PII. Encrypting the login-lookup field adds
  real complexity for no customer-data benefit.
- `TeamMember.email`, `SiteSettings` company contact fields — already public
  business info shown on the live site.

## How it works

- `encryptField`/`decryptFieldOrNull` (AES-256-GCM, random IV per value,
  format `v1:<iv>:<authTag>:<ciphertext>`, all base64).
- `blindIndex` (HMAC-SHA256) gives a deterministic, non-reversible value for
  **exact-match** lookups (duplicate-check, newsletter dedup) on a field
  whose real value is encrypted non-deterministically and therefore can't be
  queried directly. Stored in a separate `emailIndex` column, **not** a DB
  unique/NOT NULL constraint — see "Why no DB-level uniqueness" below.
- `decryptFieldOrNull` fails open to the raw value for anything not in
  `v1:...` form, so legacy plaintext rows written before this change display
  correctly even before the backfill script runs (see below). This also
  means the mixed encrypted/plaintext state is safe at any point in the
  rollout — there's no hard ordering requirement between deploying this code
  and running the backfill.
- Admin **free-text search** on leads (`GET /admin/leads?search=`) can't use
  a DB `contains` on ciphertext, so when `search` is present it decrypts and
  filters in application code instead of paginating in the DB. Fine at this
  table's scale (a single company's inbound leads); would need revisiting if
  this table ever reaches millions of rows.

## Why no DB-level uniqueness on `emailIndex`

Making `NewsletterSubscriber.emailIndex` `@unique NOT NULL` would require
either a hard-ordered rollout (migration → backfill → second migration to
add the constraint, with the app unable to run safely on a DB that only has
the first migration applied) or a backfill baked into the migration SQL
itself (via `pgcrypto`, no app code). Neither was worth the complexity here:
dedup is enforced in application code (`findFirst` by `emailIndex` before
create/update in `routes/newsletter.ts`), which is sufficient for a
low-concurrency newsletter-signup form. A race condition would at worst
create two subscriber rows for the same email — self-correcting, not a data
integrity issue.

## Required one-time step: backfill existing data

Any database with rows written before this change (VPS production, shared
staging, teammates' local DBs) needs the backfill script run once, after
deploying this code and the accompanying migration:

```bash
# Local / any directly-reachable DB:
cd backend
npm run db:backfill-pii-encryption -- --dry-run   # see counts first
npm run db:backfill-pii-encryption

# VPS (via the SSH tunnel helper):
./scripts/db-vps.sh env
cd backend
DATABASE_URL="$(grep DATABASE_URL .env.vps | cut -d'"' -f2)" \
  npx tsx scripts/backfill-pii-encryption.ts --dry-run
DATABASE_URL="$(grep DATABASE_URL .env.vps | cut -d'"' -f2)" \
  npx tsx scripts/backfill-pii-encryption.ts
```

The script is idempotent — it only touches rows whose `email` isn't already
in `v1:...` form, so re-running it (or running it again after new plaintext
rows accumulate) is always safe. A freshly created database has no legacy
rows, so this step is a no-op there.

## `ENCRYPTION_KEY`

Required in production (the app refuses to boot without it, same pattern as
`JWT_SECRET`). Generate with `openssl rand -hex 32`. **Losing this key makes
all encrypted rows permanently unreadable** — back it up the same way you'd
back up `JWT_SECRET`/`JWT_REFRESH_SECRET`. Changing it without first
decrypting-and-re-encrypting existing data has the same effect as losing it.

## Verifying it worked

```bash
# Counts should be 0 after the backfill:
npm run db:backfill-pii-encryption -- --dry-run
```

Admin lead/newsletter/quiz listings and CSV export should show plaintext
email/phone as before — decryption is transparent to anyone using the admin
UI.
