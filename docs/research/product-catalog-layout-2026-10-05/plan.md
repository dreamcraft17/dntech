# DN Tech Product Catalog Layout Research Plan

Generated: 2026-10-05  
Decision: How should the `/products` catalog layout change so it feels like a credible software house/product studio rather than a generic card grid?

## Reframe

The question is not “which visual trend should DN Tech copy?” It is:

> How can the catalog help a buyer identify the product closest to their work, understand product maturity/proof, and take the next step with low scanning effort?

## Falsifiable hypotheses

1. A featured-product hero plus supporting product index will create stronger hierarchy than an equal-weight three-column grid.
2. Outcome/use-case cues, status, pricing signal, and one clear CTA will help buyers shortlist faster than feature-only cards.
3. A static workflow-preview panel can communicate product credibility without requiring unverified customer metrics or new media assets.
4. A restrained editorial/SaaS composition with one dark anchor and white decision cards will fit DN Tech’s existing brand better than a flashy dashboard clone.

## Research blocks

- Pattern scan: product studios and software houses that show featured products, selected work, outcomes, and process.
- UX task: identify fit, status, price signal, and next step.
- Market fit: preserve the job-led product wedge from the existing DN Tech segment research.
- Product/PM: define scope, out-of-scope, success metrics, and acceptance criteria.
- Engineering: keep CMS/API contract unchanged and retain responsive/a11y behavior.

## Sources

- Existing DN Tech product-page UX decision and local implementation.
- Public product studio/software house sites: i10Studios, thoughtbot, Looplogic, Orion Software, DARN.
- Existing DN Tech product-marketing context and segment score.

## Opposition queries

- Could the dark featured hero over-index one product and hide the rest?
- Does a “workflow preview” imply product functionality that is not actually shown?
- Would a compact index work worse on mobile than the old cards?
- Is the pattern too close to a generic SaaS dashboard?

## Risk register

| Risk | Mitigation |
|---|---|
| Unsupported proof claim | Use descriptive copy only; no invented customer metrics |
| Featured product bias | Use CMS `featured`; keep every other product in the index |
| Mobile density | Stack hero columns; use readable cards and preserve 44px+ targets |
| Motion/performance regression | Keep transitions GPU-safe, rely on existing reduced-motion CSS, no new JS animation |
| CMS/API regression | Reuse `Product` fields; no schema or endpoint change |

## Stop criteria

Rollback or simplify if the product page fails build/typecheck, drops keyboard access, hides available products, or causes the featured panel to load materially heavier media.

