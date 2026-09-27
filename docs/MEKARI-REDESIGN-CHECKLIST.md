# Mekari-inspired public UI — rollout checklist

> **Author:** Dozer  
> **Date:** 2026-09-28  
> **Status:** Public marketing UI **100%** on shared design system (admin CMS unchanged)

SSOT desain: `docs/research/mekari-inspired-design-2026/2026-09-27_decision.md` (solution-led IA, DN navy/teal/orange — bukan clone Mekari).

## Design system primitives

| Primitive | Path | Role |
|-----------|------|------|
| Canvas + tokens | `frontend/src/app/globals.css` | `--radius-card`, `.saas-page`, `.saas-panel`, `.saas-cta-band`, `.home-section` |
| Shell | `PublicPageShell.tsx` | Lebar konsisten, padding vertikal |
| Intro | `PageIntro.tsx` | Kicker + H1 + dek |
| Detail hero | `DetailPageHeader.tsx` | Sama type scale, + actions |
| Breadcrumb | `PageBreadcrumb.tsx` | Detail & legal |
| Empty state | `SaasEmptyState.tsx` | Panel kosong konsisten |
| Section blocks | `DetailSection.tsx` | H2 + konten / panel |
| End CTA | `PageEndCta.tsx` | Band navy konversi |
| Chrome | `Header.tsx`, `Footer.tsx`, `StickyCTA.tsx` | Nav IA Mekari-style (Layanan / Bukti / Resources) |

## Public routes (22) — complete

Semua route di `(public)/` memakai canvas `#f1f5f9`, shell/panel, intro atau detail hero, dan `PageEndCta` kecuali yang noted.

| Route | Status |
|-------|--------|
| `/` + home sections | ✓ `home-section` / `home-section-alt` rhythm |
| `/about` … `/thank-you` | ✓ |
| `/*/[slug]` detail | ✓ breadcrumb + `DetailPageHeader` / panels |
| `/blog/[slug]` | ✓ `.saas-page` + article layout |

## Explicitly out of scope

- **`/admin/**`** — internal CMS (tetap `admin-shell`, fungsi > marketing polish)
- Pixel clone mekari.com — forbidden by ADR

## Quality gates

- `npm run build` — required green before deploy
- `npm test -- Footer` — footer IA regression
- Manual: Lighthouse a11y ≥ 90 on `/`, `/contact`, `/products` (recommended)

## Maintenance

Saat menambah halaman public baru: `PublicPageShell` + `PageIntro` atau `DetailPageHeader` + `PageEndCta`. Jangan menambah wrapper `py-16 max-w-*` one-off.
