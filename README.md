# DN Tech Company Profile Website

Modern company profile website with integrated admin dashboard for content management.

## Architecture

- **Frontend**: Next.js 16 + React + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT with role-based access control (RBAC)

## Features

### Public Website
- Home page with hero, services, testimonials, blog preview
- Services listing & detail pages with filtering
- Portfolio/case studies showcase
- Blog with categories, search, pagination
- About page with mission, vision, values, team
- Contact forms (general, service request, career)
- FAQ with accordion & search
- Careers page
- Testimonials page
- Terms of Service & Privacy Policy
- Sitewide search
- SEO (sitemap, robots.txt, meta tags)

### Admin Dashboard
- Authentication with JWT
- Dashboard with analytics overview
- CRUD: Services, Portfolio, Blog, Team, Testimonials, FAQs, Careers
- Lead management with status tracking, notes, CSV export
- Media library with upload
- Analytics (traffic, conversions, device breakdown)
- Site settings
- User management (SuperAdmin only)
- Role-based access: SuperAdmin, ContentManager, Editor, Viewer

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+ (or Docker)

### Option 1: Docker (Recommended)

```bash
docker-compose up -d
```

- Website: http://localhost:3000
- API: http://localhost:4000
- Admin: http://localhost:3000/admin/login

### Option 2: Local Development

1. **Start PostgreSQL** (or use Docker for DB only):
   ```bash
   docker-compose up -d db
   ```

2. **Backend**:
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npx prisma db push
   npm run db:seed
   npm run dev
   ```

3. **Frontend**:
   ```bash
   cd frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

### Default Admin Credentials

- **Email**: admin@dntech.id
- **Password**: Admin@123456

## API Documentation

Base URL: `http://localhost:4000/api/v1`

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /services | List active services |
| GET | /services/:slug | Service detail |
| GET | /portfolio | List portfolio items |
| GET | /blog | List blog posts |
| POST | /forms/contact | Submit contact form |
| GET | /search?q= | Sitewide search |

### Admin Endpoints (Bearer token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Login |
| GET | /admin/services | List all services |
| POST | /admin/services | Create service |
| GET | /admin/leads | List leads |
| GET | /admin/analytics/overview | Dashboard metrics |

See PRD/files2 for full API specification.

## Project Structure

```
dntech/
├── backend/          # Express API server
│   ├── prisma/       # Database schema & seeds
│   └── src/
│       ├── routes/   # API route handlers
│       └── middleware/
├── frontend/         # Next.js application
│   └── src/
│       ├── app/
│       │   ├── (public)/  # Public website pages
│       │   └── admin/     # Admin dashboard
│       └── components/
├── docker-compose.yml
└── PRD/              # Product requirements
```

## Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Secret for JWT signing |
| PORT | API port (default: 4000) |
| FRONTEND_URL | Frontend URL for CORS |

### Frontend (.env.local)
| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_API_URL | Backend API URL |

## License

Proprietary - DN Tech © 2026
# dntech
