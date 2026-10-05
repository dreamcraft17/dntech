# Source 02 — Local catalog contract and CMS fields

- Type: primary / repository evidence
- Files: `frontend/src/app/(site)/[locale]/(public)/products/ProductCatalog.tsx`, `frontend/src/types/index.ts`
- Reviewed: 2026-10-05

## Evidence

The catalog already receives product name, slug, description, tagline, category, featured flag, launch status, customer count, pricing tiers, features, and CTAs. The redesign reuses these fields and adds no database/API dependency.

## Short quote

> “Every product page covers use cases, pricing, limits, and how to get started.”

## Interpretation

The UI can increase hierarchy and scanability without changing product content ownership or backend routes.

