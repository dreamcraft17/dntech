# DN Tech Changelog

All notable changes to the DN Tech company profile website (`dntech.id`).

## [0.8.1] — 2026-07-26

### Fixed
- **Product detail crash on `/products/dnpeople`** — removed misplaced `ROICalculator` from product pages; hardened calculator with local rate fallbacks. See `docs/BUG_FIXES.md` **BF-017**.

### Docs
- Added `docs/BUG_FIXES.md` and this changelog.
- Updated `IMPLEMENTATION-STATUS.md`, `PROJECT-OVERVIEW.md`, `QA-CHECKLIST-V8.md`, `DN-TECH-PRD-V8-FOUNDATION.md`, `README.md`.

---

## [0.8.0] — 2026-07-24 (prior)

### Added (V8 codebase — see commit history)
- Auth refresh, forgot-password email, health check improvements, product guided editor, CI workflow, multi-product playbook docs.

---

## [0.7.0] — 2026-07-16

### Changed
- dnPeople product seed copy refresh (`seed-dnpeople-product.ts`).

---

## [0.6.x] — 2026-07-12 / 13

### Added
- V6 Product module (`/products`, admin CRUD).
- V7 dnPeople flagship product page fields (pricing tiers, integrations, comparison, roadmap).
- Loading UX global + public product API SSR hotfix.

---

## [0.5.0] — 2026-07 (V5)

### Added
- SMTP email system, newsletter double opt-in, admin email logs.

---

## [0.4.0] — 2026-07 (V4)

### Changed
- Performance: debounced search, deferred GA/Crisp, API cache, `next/image`, removed Google Fonts build dependency.

---

## Earlier

See `docs/v3/`, `docs/v4/`, `docs/v5/`, `docs/V2/` for versioned PRD history (V1–V5).

| | |
|---|---|
| Owner | Dozer (CEO + Tech Lead) |
| Company | DN Tech (PT. Dozer Napitupulu Technology) |
| UpdatedAt | July 26, 2026 |

Property of DN Tech - PT. Dozer Napitupulu Technology . 2026
