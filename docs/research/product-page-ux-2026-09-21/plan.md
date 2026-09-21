# Product page UX research plan

Date: 2026-09-21
Scope: public `/products` catalog and `/products/[slug]` detail pages in `dntech/frontend`.
Decision: replace the current generic/detail-heavy UI and remove the embedded demo/tutorial block from product detail; keep one clear conversion path.

## Hypotheses

1. Visitors will understand product fit faster when the catalog leads with outcomes, audience, status, and one next action instead of a feature teaser list alone.
2. Product detail pages will be easier to scan when the first viewport contains a product promise, proof snapshot, CTA, and key facts.
3. A static workflow/proof panel is a better default than an embedded tutorial/demo block for a CMS-driven product page: lower distraction, lower page weight, and no dependency on a video URL.

## Evidence plan

- Local: inspect page structure, product type, API payload, seed content, and existing components.
- External UX: product-page information hierarchy, findability, and image/performance guidance.
- Adversarial check: do not claim that removing video universally improves conversion; treat it as a default for this product catalog until behavior data says otherwise.

## Success criteria

- No tutorial/video embed in product detail.
- Primary CTA visible in first viewport and repeated once at the end.
- Detail page presents product promise, audience/status, proof snapshot, features, pricing, FAQ, and related content without hiding core information in tabs.
- No API/schema changes; existing CMS payloads remain compatible.
- Frontend typecheck/build and existing tests pass.

