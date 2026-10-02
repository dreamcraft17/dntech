# Source 06 — MDN: prefers-reduced-motion

- URL: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
- Type: Web platform and accessibility reference
- Publisher: MDN Web Docs
- Accessed: 2026-10-02
- Scores: credibility 5/5, recency 5/5, bias 5/5

## Relevant evidence

MDN documents `prefers-reduced-motion: reduce` as the browser signal that a user
has requested less non-essential movement. It specifically notes that scaling and
panning can be problematic for some users.

## Design implication

The service cards render fully without motion, and their entrance/hover transitions
are removed inside the reduced-motion media query.
