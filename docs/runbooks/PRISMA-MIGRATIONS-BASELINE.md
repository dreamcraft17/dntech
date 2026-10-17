# Prisma migrations baseline (2026-10-18)

> **Author:** Dozer · **Date:** 2026-10-18 · **Status:** Active

## What changed

`backend/prisma/migrations/` did not exist before this date — schema changes
were applied with `prisma db push` directly against the live database, both
in the VPS deploy script (`scripts/deploy.sh`) and the Docker image
(`backend/Dockerfile`). `db push` has no migration history, can't be rolled
back, and gives no reviewable diff before it touches production data. This
was flagged as a CRITICAL finding in `SHIP-GATE-REPORT-2026-10-18.md`.

A baseline migration — `backend/prisma/migrations/20261017195846_baseline/` —
was generated from the current `schema.prisma` with:

```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/20261017195846_baseline/migration.sql
```

It was verified against a disposable local Postgres instance: applying it
with `prisma migrate deploy` reproduces the schema with **zero drift**
(`prisma migrate diff --from-url <db> --to-schema-datamodel schema.prisma`
returns an empty diff), and `prisma/seed.ts` runs cleanly against the result.

`scripts/deploy.sh` and `backend/Dockerfile` now run `prisma migrate deploy`
instead of `prisma db push`. From here on, schema changes go through
`npm run db:migrate` (local, generates a new migration file) and are
committed to `prisma/migrations/` like any other code change.

## Required one-time step before the next deploy

Every database that already has this schema applied via the old `db push`
flow (VPS production, any shared staging DB, teammates' local DBs) needs to
be told the baseline migration is **already applied** — otherwise
`prisma migrate deploy` will try to `CREATE TABLE` on tables that already
exist and fail loudly (safe, but it will block the deploy).

Run this **once per existing database**, before the first `migrate deploy`
against it:

```bash
# Against the VPS database (via the SSH tunnel helper):
./scripts/db-vps.sh env   # writes backend/.env.vps
cd backend
DATABASE_URL="$(grep DATABASE_URL .env.vps | cut -d'"' -f2)" \
  npx prisma migrate resolve --applied 20261017195846_baseline

# Against any other existing database (local dev, staging):
cd backend
npx prisma migrate resolve --applied 20261017195846_baseline
```

`migrate resolve --applied` only writes a row to the `_prisma_migrations`
tracking table — it does not run the migration's SQL. A database that is
freshly created (no existing tables) does not need this step; just run
`prisma migrate deploy` normally and it will apply the baseline for real.

## Verifying it worked

```bash
npx prisma migrate status
# Expect: "Database schema is up to date!"
```

If `migrate deploy` ever fails with `P3018` on `20261017195846_baseline`
against a database that already had this schema, that database skipped the
`migrate resolve --applied` step above.
