# Research Plan — DN Tech SEO and Market Audit

## Decision

Determine whether dntech.id can be crawled/indexed reliably and which service segments deserve focused SEO pages and message experiments.

## Scope

- Public Next.js route architecture, metadata, sitemap, robots, canonical, JSON-LD, and homepage HTML.
- Market segments for DN Tech software engineering/services and dnPeople as product proof.
- No TAM/SAM/SOM quote without sourced market-size inputs.

## Falsifiable hypotheses

1. Production configuration is the highest technical SEO risk because URL helpers have inconsistent localhost fallbacks.
2. DN Tech will be more differentiable when pages target concrete problems—MVP/product engineering, legacy integration, and multi-branch workflow—rather than generic “custom software”.
3. The homepage has a sound information architecture but needs metadata and Search Console/real-user validation before performance claims.

## Methods

- Static source inspection and build output inspection.
- `seo_checker.py` on homepage HTML.
- Kotler five-criteria segment scoring via `segmentation_scorer.py --profile services`.
- Official Google Search Central sources for technical SEO recommendations.

## Assumptions register

- Segment scores are editorial hypotheses, not survey results.
- No live GSC access was available.
- No live production DNS/HTTP measurement was available from the current shell environment.
- The current public product/service catalog is the best available implementation evidence.

## Opposition queries

- Is localhost fallback harmless? No, not if the environment variable is absent in production.
- Does a high on-page score prove ranking? No; crawl, performance, authority, and intent remain unmeasured.
- Should DN Tech target all startups and UMKM? Not automatically; serviceability and differentiation need proof.

## Stop criteria

- Build/lint complete.
- Homepage checker run and evidence recorded.
- Segment scorer run with assumptions recorded.
- At least three independent official Google sources support the SEO guidance.
- GSC/live verification gaps explicitly called out.
