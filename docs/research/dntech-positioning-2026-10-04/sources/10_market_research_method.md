# Source 10 — Market-research methodology used in this decision

- Type: primary / local methodology implementation
- Files: `.codex/skills/market-research/SKILL.md`, `scripts/segmentation_scorer.py`, `dntech/docs/market-research/dntech-segments.json`
- Reviewed: 2026-10-04
- Credibility: high for reproducibility; scores remain assumption-dependent

## Method

Candidate segments were scored against five criteria: measurable, substantial, accessible, differentiable, and actionable. The local scorer uses the `services` profile and enforces a substantiality/accessibility gate. The existing JSON is the input; no external market-size claim is inferred from it.

## Result

- Startup Indonesia needing MVP/product engineering: **77.6 — TARGET**
- Multi-branch companies with complex HR/payroll workflows: **76.3 — TARGET**
- Companies needing legacy integration/modernization: **70.5 — TARGET**
- UMKM needing simple operational apps: **68.5 — TARGET**
- Generic clients seeking a cheap developer: **63.9 — WATCH**

## Interpretation

The scoring supports a wedge around named jobs and higher-context buyers. It does not decide the category label by itself and must be validated with lead quality, win/loss notes, interviews, and Search Console data.

