# F1 — Production host consistency is the highest-risk technical finding

## Finding

The pre-remediation SEO helpers did not use one consistent production fallback: `seo.ts` and JSON-LD defaulted to `https://dntech.id`, while `sitemap.ts`, `robots.ts`, and the example environment used localhost or a commented `www` configuration. A missing production environment value could create invalid sitemap/robots URLs.

## Evidence

- Local source: `frontend/src/lib/seo.ts`, `frontend/src/components/seo/JsonLd.tsx`, `frontend/src/app/sitemap.ts`, `frontend/src/app/robots.ts`, `frontend/.env.example`.
- Build output includes `/sitemap.xml` and `/robots.txt`, but build success alone does not prove the deployed host is correct.

## Remediation

`sitemap.ts` and `robots.ts` now import the shared `SITE_URL`; the example production configuration and README now use `https://dntech.id`.

## Decision implication

Set one canonical production host explicitly and add a deployment smoke test that rejects localhost, HTTP, preview, and host mismatches in generated SEO output.
