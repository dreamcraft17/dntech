# JSON-blob fields on the Product model vs normalized child tables

> **Author:** Dozer
> **Date:** 2026-09-05

**Status:** Accepted

## Context

`backend/prisma/schema.prisma`'s `Product` model (roughly lines 139-193)
stores most repeating/structured content as `Json?` columns directly on
the product row rather than as separate related tables. Examples already
in the schema: `features`, `screenshotUrls`, `techStack`, `pricingTiers`,
`integrations`, `useCases`, `testimonials`, `caseStudies`,
`comparisonTable`, `roadmap`, `primaryCta`, `secondaryCtas`, and `faq`.

None of these have a dedicated child table (e.g. no `ProductFeature` or
`ProductPricingTier` model with a `productId` foreign key) — each is an
opaque JSON value read and written as a whole alongside the rest of the
product row. Products are admin-authored CMS-style content, read
primarily as a single assembled product page, and the shapes of these
fields vary significantly product-to-product (e.g. not every product has
`caseStudies` or a `comparisonTable`, and the number/shape of pricing tiers
differs per product).

## Options Considered

1. **Normalize every repeating structure into its own child table** — a
   `ProductFeature`, `ProductPricingTier`, `ProductTestimonial`, etc. table
   per JSON field, each with a FK back to `Product`. Gives relational
   integrity, per-field type-safety via Prisma, and native SQL
   filtering/aggregation across products.
2. **JSON blobs on the parent row** (chosen) — keep these as `Json?`
   columns on `Product`.
3. **Hybrid — normalize only fields with real query/filter needs** and
   leave the rest as JSON (e.g. normalize `pricingTiers` for billing/plan
   queries, keep `roadmap`/`faq`/`testimonials` as blobs).

## Decision

Keep these fields as JSON blobs on `Product` (Option 2). This was chosen
because:

- Product content shapes vary widely across products and change
  frequently as the CMS/admin content model iterates; a blob absorbs
  shape changes without a schema migration.
- Products are read as one whole page in the common path, so a blob
  avoids N+1 joins/queries across a dozen-plus child tables to render a
  single product.
- The admin-managed, low-cardinality nature of this content (a handful of
  products, edited rarely, by trusted internal admins) makes relational
  integrity and cross-product SQL querying low-value relative to the
  schema and iteration-speed cost of full normalization.

## Consequences

- No relational integrity or type-safety on blob contents: Prisma/Postgres
  cannot enforce the shape of `features`, `pricingTiers`, etc. — malformed
  or drifting JSON shapes are only caught at the application layer, if at
  all.
- Harder to query, filter, or aggregate across products by blob contents —
  e.g. there is no straightforward SQL way to answer "all products with a
  pricing tier under $50" without either loading and filtering in
  application code or reaching for JSON-specific SQL operators against a
  semi-structured column.
- Schema evolution inside the JSON (renaming a key, adding a new field to
  every `pricingTiers` entry, etc.) is not tracked or enforced by Prisma
  migrations — it happens silently in application/seed code and can leave
  older rows with a stale shape.
- In exchange, the relational schema stays simple (one `Product` table
  instead of a dozen+ child tables) and iteration on content shape is fast
  — adding a new field to `pricingTiers` needs no migration, unlike adding
  a column to a normalized `ProductPricingTier` table.
