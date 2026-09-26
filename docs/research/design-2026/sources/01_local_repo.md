# Source 01 — DN Tech local implementation audit

- Type: primary / repository evidence
- Location: `/Users/dozer-entropi/dozer/dntech`
- Reviewed: 2026-09-26

## Evidence

- `frontend/src/app/(public)` contains routes for services, products, case studies, portfolio, blog, about, team, FAQ, quiz, resources, contact, legal pages, and product/service detail pages.
- `frontend/src/components/common/Header.tsx` has six top-level links plus search and a prominent “Konsultasi Gratis” CTA.
- `frontend/src/components/homepage/HomeHero.tsx` already uses problem-led Indonesian copy, two CTAs, three focus badges, and three advantage labels.
- `frontend/src/lib/design-tokens.ts` defines primary `#1E3A8A`, secondary `#0D9488`, accent `#EA580C`, a max-width container, section spacing, and a 48px touch target minimum.
- The Prisma `Product` model supports pricing tiers, use cases, integrations, testimonials, case studies, roadmap, primary CTA, demo URL, and FAQ—enough to make product pages evidence-rich without a new data model.
- Local architecture script detected a layered shape with 0 layer violations; the frontend bundle analyzer scored 85/100 and flagged mainly dev-only Tailwind packages in production dependencies and an opportunity to optimize `lucide-react` imports.

## Interpretation

The existing product and content model can support a design direction based on proof and job-to-be-done. The main opportunity is hierarchy and editorial discipline, not a rewrite.

