# DN Tech Company Profile Website

Production-ready company profile website for DN Tech with a public marketing site, admin CMS, lead generation, analytics, and SEO foundations.

## Current Status

| Area | Status | Notes |
|------|--------|-------|
| Public website | Implemented | Content is database/admin-driven, no fake demo content |
| Admin CMS | Implemented | Services, blog, team, FAQ, careers, leads, analytics, settings, users |
| PRD/Design/SEO V2 | Implemented | Solid color design system, Indonesian copy, startup/SME positioning |
| V3 refinements | Implemented | Exit intent fix, logo variants, mobile nav polish, form accessibility |
| Frontend build | Passing | `npm run build` succeeds when build server can access Google Fonts |
| Full lint | Known issues | Existing admin/AuthContext React hook lint errors remain |
| Performance | Needs optimization | See `docs/IMPLEMENTATION-STATUS.md` for audit findings |

Latest implementation reference: `c3b862f` — `Implement v3 UX refinements`.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL, Prisma ORM
- **Auth:** JWT with role-based access control
- **Deployment:** PM2/Nginx or Docker Compose

## Key Features

### Public Website

- Homepage with hero, real stats, services, blog preview, team preview, newsletter, and CTA
- Services listing and detail pages with process steps, FAQ, related articles, Calendly CTA
- Blog with categories, pagination, reading time, SEO metadata, JSON-LD
- About, team, contact, FAQ, careers, resources, portfolio/case studies, testimonials
- Contact lead form with multi-step validation, duplicate email check, consent, thank-you flow
- Sitewide search from the header
- Exit intent modal V3: desktop top-edge trigger, max once per session, mobile disabled
- SEO: sitemap, robots.txt, canonical metadata, Open Graph, structured data

### Admin Dashboard

- JWT login and RBAC roles: `SuperAdmin`, `ContentManager`, `Editor`, `Viewer`
- CRUD for services, portfolio/case studies, blog, team, testimonials, FAQ, careers
- Lead management with status updates, notes, duplicate check, CSV export
- Media library upload
- Analytics overview and conversion tracking
- Newsletter subscribers and quiz submissions
- Site settings for company info, homepage copy, legal content, GA, Crisp, Calendly
- User management for SuperAdmin

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm

### Docker

```bash
docker compose up -d
```

Default local URLs:

- Website: `http://localhost:3000`
- API: `http://localhost:4000`
- Admin: `http://localhost:3000/admin/login`

### Local Development

Start PostgreSQL:

```bash
docker compose up -d db
```

Backend:

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Default admin:

- Email: `admin@dntech.id`
- Password: `Admin@123456`

## Build & Verification

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm run build
```

Notes:

- Frontend build uses `next/font/google` for Inter, so the build environment must be able to reach Google Fonts unless the font is self-hosted.
- `npm run lint` in `frontend` currently reports known existing issues in admin/AuthContext areas. V3-touched files were checked separately and have no blocking lint errors.

## Deployment Notes

Typical VPS update:

```bash
git pull --rebase
```

Docker deployment:

```bash
docker compose down
docker compose build
docker compose up -d
```

PM2-style deployment:

```bash
cd backend
npm ci
npx prisma generate
npm run build
pm2 restart dntech-api

cd ../frontend
npm ci
npm run build
pm2 restart dntech-web
```

If `git pull --rebase` is blocked by `docs/IMPLEMENTATION-STATUS.md`, move the local untracked file first:

```bash
mv docs/IMPLEMENTATION-STATUS.md /tmp/IMPLEMENTATION-STATUS.local.md
git pull --rebase
```

## Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `PORT` | API port, usually `4000` |
| `FRONTEND_URL` | Public frontend URL for CORS |
| `TRUST_PROXY` | Set `1` behind Nginx/reverse proxy |
| `SENDGRID_API_KEY` | SendGrid API key |
| `SENDGRID_FROM_EMAIL` | Sender email |
| `SALES_EMAIL` | Sales notification recipient |

### Frontend `.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL, e.g. `https://api.dntech.id/api/v1` |
| `NEXT_PUBLIC_ENABLE_EXIT_MODAL` | Set `false` to disable V3 exit modal |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | Optional build-time Crisp website ID |

## API Overview

Base local URL: `http://localhost:4000/api/v1`

Public endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/services` | Active services |
| `GET` | `/services/:slug` | Service detail |
| `GET` | `/blog` | Blog list |
| `GET` | `/blog/:slug` | Blog detail |
| `GET` | `/team` | Team members |
| `GET` | `/faq` | FAQ list |
| `GET` | `/settings` | Public site settings |
| `POST` | `/leads` | Submit lead |
| `POST` | `/newsletter/subscribe` | Subscribe email |
| `GET` | `/search?q=` | Sitewide search |

Admin endpoints are under `/admin/*` and require a bearer token.

## Project Structure

```text
dntech/
├── backend/
│   ├── prisma/
│   └── src/
│       ├── routes/
│       ├── services/
│       ├── middleware/
│       └── utils/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (public)/
│       │   └── admin/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── types/
├── docs/
│   ├── V2/
│   ├── v3/
│   ├── IMPLEMENTATION-STATUS.md
│   └── DEPLOYMENT-PRODUCTION.md
├── docker-compose.yml
└── README.md
```

## Performance Audit Summary

The current site is functional, but the first-load performance can be improved. Main findings are documented in `docs/IMPLEMENTATION-STATUS.md`.

Highest-impact items:

- Homepage SSR waits for multiple API requests.
- Public settings are fetched multiple times across layout, homepage, GA loader, and Crisp loader.
- GA/Crisp/internal analytics add client-side requests after hydration.
- Some public images still use raw `<img>` instead of `next/image`.
- Header search calls the API without debounce.
- Build depends on Google Fonts network access.

## Documentation

| Document | Purpose |
|----------|---------|
| `docs/IMPLEMENTATION-STATUS.md` | Current implementation status and performance audit |
| `docs/PROJECT-OVERVIEW.md` | Technical project overview |
| `docs/DEPLOYMENT-PRODUCTION.md` | Production deployment guide |
| `docs/V2/` | PRD, design system, and SEO guide V2 |
| `docs/v3/` | V3 refinement PRD, SDD, summary, and implementation guide |
| `docs/DNTECH-COMPANY-PROFILE.md` | Company profile content reference |

## License

Proprietary - DN Tech © 2026
