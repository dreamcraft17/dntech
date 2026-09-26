# F3 — Evolve the current system; do not replace the stack

## Thesis

Deliver the redesign as an incremental system: a navigation/content hierarchy pass, a small set of reusable page primitives, then template-by-template proof improvements. Keep Next.js, the current CMS/API, and existing token structure.

## Evidence

- Current implementation has shared header, footer, buttons, cards, hero, CTA, form, product/service components, and a content-capable Prisma model (source 01).
- Local architecture analysis found no layer violations; bundle score was 85/100 with limited, actionable warnings (source 01).

## Confidence

High for delivery risk and reversibility.

