# Adoption of Next.js 16 / React 19 / Express 5

> **Author:** Dozer
> **Date:** 2026-09-05

**Status:** Accepted

## Context

The `dntech` monorepo ships on bleeding-edge major versions of its core
frameworks rather than the previous stable majors:

- `frontend/package.json` pins `next@16.2.9`, `react@19.2.4`,
  `react-dom@19.2.4`, `eslint-config-next@16.2.9`.
- `backend/package.json` pins `express@^5.1.0`.

These are not incremental point releases — Next.js 16 and Express 5 both
carry breaking changes over the prior stable majors (Next 14/15, Express 4).
This is significant enough that the frontend ships a house warning,
`frontend/AGENTS.md`, telling contributors:

> "This is NOT the Next.js you know. This version has breaking changes —
> APIs, conventions, and file structure may all differ from your training
> data. Read the relevant guide in `node_modules/next/dist/docs/` before
> writing any code."

That warning exists because AI coding assistants (and human contributors)
default to patterns from the previous stable majors, which are wrong here
and can silently compile while behaving incorrectly at runtime — most
visibly in SSR/data-fetching code paths.

## Options Considered

1. **Stay on last-stable majors** (Next 14/15, React 18, Express 4) — larger
   community, training-data alignment, mature third-party ecosystem, but
   forgoes newer framework features/perf and requires an eventual migration
   anyway.
2. **Adopt bleeding-edge majors** (Next 16, React 19, Express 5) — chosen.
   Early access to current framework capabilities and performance work, at
   the cost of ecosystem lag and a smaller pool of prior art to debug
   against.
3. **Hybrid / gradual upgrade path** — pin backend to Express 4 while
   frontend moves to Next 16/React 19, upgrading each independently on its
   own schedule. Rejected for this repo: the two apps are decoupled enough
   (separate `package.json`, separate deploy targets) that there was no
   integration reason to stagger them, and staggering adds two migration
   events instead of one.

## Decision

Adopt Next.js 16, React 19, and Express 5 across the stack now (Option 2),
accepting the AGENTS.md-mandated process of reading
`node_modules/next/dist/docs/` before writing Next.js code, rather than
relying on trained-in knowledge of older Next.js conventions.

## Consequences

- Contributors (human and AI) must consult in-repo/in-`node_modules` docs
  before writing Next.js code, per `frontend/AGENTS.md`, instead of relying
  on general training knowledge — this is now a mandatory step in the dev
  process, not a suggestion.
- Ecosystem lag: fewer StackOverflow/blog answers, examples, and
  third-party library compatibility notes exist for these majors compared
  to Next 14/15 or Express 4, increasing time spent reading source/docs
  directly when something misbehaves.
- There has been a real pattern of production SSR bugs in this repo's
  history plausibly linked to the bleeding-edge Next.js data-fetching
  model diverging from familiar conventions, e.g. `217cbf5` (404 on
  `/services/[slug]` in production SSR), `d23d21d` (migrate all public SSR
  pages to `fetchPublicApi` helpers, BF-020), `35bd6d3` (wire homepage
  services to the admin API for SSR), and `e5cbb3b` (home page build crash
  when the API returns null arrays). This is an honest downside of the
  choice, not a hypothetical risk.
- Upside realized: the stack has access to current Next.js/React/Express
  capabilities and performance improvements without waiting for a future
  migration cycle.
