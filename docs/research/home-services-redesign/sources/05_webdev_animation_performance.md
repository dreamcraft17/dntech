# Source 05 — web.dev: Animations and performance

- URL: https://web.dev/articles/animations-and-performance?hl=en
- Type: Browser performance guidance
- Publisher: Google web.dev
- Accessed: 2026-10-02
- Scores: credibility 5/5, recency 3/5, bias 5/5

## Relevant evidence

web.dev recommends limiting animation to properties the browser can optimize well,
especially `opacity` and `transform`, and warns that overusing `will-change` can
also waste resources.

## Design implication

The service showcase uses a one-shot CSS entrance and hover lift with opacity and
transform only. It does not add a runtime animation dependency or blanket
`will-change` declarations.
