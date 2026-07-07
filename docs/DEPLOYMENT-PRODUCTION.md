# Production Deployment (Ubuntu + PostgreSQL)

## 1. PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE dntech;
CREATE USER dntech_user WITH ENCRYPTED PASSWORD 'dntech2026!';
GRANT ALL PRIVILEGES ON DATABASE dntech TO dntech_user;
ALTER DATABASE dntech OWNER TO dntech_user;
\c dntech
GRANT ALL ON SCHEMA public TO dntech_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dntech_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dntech_user;
\q
```

> Password dengan karakter `!` **hanya aman di file `.env`**, jangan paste langsung ke terminal bash (history expansion).

## 2. Backend `.env`

Edit via `nano` (bukan paste ke shell):

```env
NODE_ENV=production
PORT=4000
DATABASE_URL="postgresql://dntech_user:dntech2026!@localhost:5432/dntech?schema=public"
JWT_SECRET="GANTI_DENGAN_STRING_RANDOM_PANJANG_MIN_32_KARAKTER"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_EXPIRES_IN="7d"
FRONTEND_URL="https://www.dntech.id"
UPLOAD_DIR=./uploads
ADMIN_EMAIL=admin@dntech.id
ADMIN_PASSWORD=Admin@123456
```

Encode `!` di URL jika perlu: `dntech2026%21`

## 3. Install & build backend

```bash
cd /var/www/dntech/backend

# Pastikan server bisa akses internet ke Prisma CDN
curl -I https://binaries.prisma.sh

npm install

# Jika postinstall gagal, jalankan manual:
npx prisma generate

npm run build
npx prisma db push
npm run db:seed
```

### Prisma generate gagal (network)

```bash
# Cek DNS & HTTPS
ping -c 2 binaries.prisma.sh
curl -fsSL https://binaries.prisma.sh/all_commits/c2990dca591cba766e3b7ef5d9e8a84796e47ab7/debian-openssl-3.0.x/schema-engine.gz.sha256

# Retry dengan debug
DEBUG="prisma:*" npx prisma generate

# Alternatif: build di mesin lokal, deploy artifact (node_modules + dist)
```

Error TypeScript seperti `UserRole` / `LeadStatus` not exported **hampir selalu** karena `@prisma/client` belum ter-generate — bukan bug kode.

## 4. Process manager (PM2)

```bash
npm install -g pm2
pm2 start dist/index.js --name dntech-api
pm2 save
pm2 startup
```

## 5. Frontend

```bash
cd /var/www/dntech/frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=https://api.dntech.id/api/v1  (atau proxy nginx)
npm install
npm run build
pm2 start npm --name dntech-web -- start
```

## 6. Nginx (contoh)

- `www.dntech.id` → frontend `:3000`
- `api.dntech.id` → backend `:4000`

## Checklist

- [ ] `schema.prisma` provider = `postgresql`
- [ ] `.env` DATABASE_URL benar (file, bukan shell)
- [ ] `npx prisma generate` sukses
- [ ] `npm run build` sukses
- [ ] `npx prisma db push` + `npm run db:seed`
- [ ] JWT_SECRET diganti random
- [ ] Firewall: 5432 hanya localhost
