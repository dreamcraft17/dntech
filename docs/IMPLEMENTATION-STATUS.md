# DN Tech — Status Implementasi & Audit Performa

Dokumen ini mencatat **semua yang sudah diimplementasikan di codebase** untuk website DN Tech, termasuk migrasi production-ready, penghapusan data demo, implementasi PRD/Design System/SEO Guide V2, refinement V3, dan hasil audit awal kenapa website terasa lambat.

**Terakhir diperbarui:** 8 Juli 2026  
**Branch:** `main`  
**Commit referensi:** `c3b862f` (Implement v3 UX refinements)  
**Status build terakhir:** ✅ `npm run build` frontend sukses setelah akses jaringan untuk `next/font/google`

---

## Daftar Isi

1. [Ringkasan](#1-ringkasan)
2. [Design System V2](#2-design-system-v2)
3. [Website Publik](#3-website-publik)
4. [Form & Lead Generation](#4-form--lead-generation)
5. [SEO & Structured Data](#5-seo--structured-data)
6. [Backend & Database](#6-backend--database)
7. [Admin Dashboard (CMS)](#7-admin-dashboard-cms)
8. [Integrasi & Email](#8-integrasi--email)
9. [Infrastruktur & Deploy](#9-infrastruktur--deploy)
10. [File & Modul Baru](#10-file--modul-baru)
11. [Yang Sengaja Tidak Di-hardcode](#11-yang-sengaja-tidak-di-hardcode)
12. [Implementasi V3](#12-implementasi-v3)
13. [Audit Performa: Kenapa Web Lambat](#13-audit-performa-kenapa-web-lambat)
14. [Checklist Verifikasi Cepat](#14-checklist-verifikasi-cepat)
15. [Referensi Dokumen](#15-referensi-dokumen)

---

## 1. Ringkasan

| Aspek | Status | Keterangan |
|-------|--------|------------|
| Bahasa UI | ✅ | Seluruh situs & admin dalam Bahasa Indonesia |
| Mata uang | ✅ | Rupiah (IDR) di form, kalkulator, quiz |
| Database | ✅ | PostgreSQL + Prisma ORM |
| Data demo | ✅ | Dihapus — seed hanya bootstrap admin |
| Design V2 | ✅ | Solid color, tanpa gradient/glassmorphism |
| Konten real | ✅ | Semua konten dari DB via admin |
| PRD V2 (teknis) | ✅ | ~85–90% fitur kode selesai |
| PRD V3 (refinement) | ✅ | Exit intent, logo variants, mobile nav, form accessibility |
| Production build | ✅ | Frontend build sukses |
| Lint full repo | ⚠️ | Masih gagal karena issue lama di admin/AuthContext, bukan dari patch V3 |
| Performance audit awal | ⚠️ | Bottleneck utama: SSR API waterfall, duplicate settings fetch, client-side tracking/chat requests |

---

## 2. Design System V2

Implementasi berdasarkan `docs/V2/DN-TECH-DESIGN-SYSTEM-V2.md`.

### Warna & Typography

| Token | Nilai | Implementasi |
|-------|-------|--------------|
| Primary | `#1E3A8A` (blue-900) | Button, hero, link, focus ring |
| Secondary | `#0D9488` (teal-600) | Badge kategori, accent tim |
| Background | `#FFFFFF`, gray-50 | Section alternatif |
| Teks | gray-900 / gray-600 | Body & secondary text |
| Font | Inter | `app/layout.tsx` + `globals.css` |
| Body min | 16px | Default di `globals.css` |
| Touch target | min 48px | Button lg, input, nav mobile |

### Komponen UI (diperbarui)

| Komponen | File | Perubahan |
|----------|------|-----------|
| Button | `frontend/src/components/ui/Button.tsx` | Primary blue-900, secondary teal outline, min-height 48px |
| Card | `frontend/src/components/ui/Card.tsx` | Flat border, tanpa shadow berat |
| Input / Select / Textarea | `frontend/src/components/ui/Input.tsx` | Focus blue-900, min-height 48px, aria error |
| Header | `frontend/src/components/common/Header.tsx` | Sticky solid white, tanpa backdrop-blur |
| Footer | `frontend/src/components/common/Footer.tsx` | Kontak & tagline dari settings |
| StickyCTA | `frontend/src/components/layout/StickyCTA.tsx` | Mobile CTA blue-900 |
| TrustBadges | `frontend/src/components/layout/TrustBadges.tsx` | Section "Mengapa Memilih Kami" |
| TeamSpotlight | `frontend/src/components/layout/TeamSpotlight.tsx` | Avatar solid (bukan gradient) |
| ExitIntentModal | `frontend/src/components/interactive/ExitIntentModal.tsx` | V3: trigger top-edge exit intent, max 1x/session, skip mobile |
| ExitIntent hook | `frontend/src/hooks/useExitIntent.ts` | Session flag, `beforeunload`, `visibilitychange`, focus restore |
| LogoLight / LogoDark | `frontend/src/components/branding/*.tsx` | Logo markup tanpa PNG background gelap |

### Anti-pattern yang dihapus

- [x] Hero gradient (`from-blue-600 via-blue-700`)
- [x] Glassmorphism / `backdrop-blur` di header
- [x] Gradient avatar tim
- [x] Shadow berat di card (`shadow-lg`, `hover:shadow-md`)
- [x] Warna primary lama `#2563eb` → diganti `#1E3A8A`

---

## 3. Website Publik

### Navigasi (V2 — startup-focused)

Menu utama yang ditampilkan:

| Route | Label |
|-------|-------|
| `/` | Beranda |
| `/services` | Layanan |
| `/about` | Tentang |
| `/blog` | Blog |
| `/contact` | Kontak |

CTA header: **"Konsultasi Gratis"**

Halaman `/quiz`, `/case-studies`, `/testimonials`, `/resources` **masih ada** tapi **tidak** di nav utama (sesuai V2 P2/P3).

### Homepage (`/`)

| Section | Implementasi |
|---------|--------------|
| Hero | Solid `bg-blue-900`, tagline & deskripsi dari settings |
| Statistik | Dari `SiteSettings.homeStats` — hidden jika kosong |
| Layanan | Max 6 dari API — hidden jika kosong |
| Mengapa Memilih Kami | Dari `SiteSettings.trustBadges` |
| Blog preview | 4 artikel + estimasi waktu baca |
| Tim preview | `TeamSpotlight` max 4 anggota |
| Newsletter | Form langganan |
| CTA akhir | "Siap mengembangkan proyek Anda?" → `/contact` |

**Dihapus dari homepage:** ROI calculator, testimonials, case studies, client logos hardcode, BookDemo section.

### Halaman Layanan

| Halaman | Fitur |
|---------|-------|
| `/services` | List layanan aktif dari DB |
| `/services/[slug]` | Deskripsi, fitur, **proses kerja 5 langkah**, FAQ accordion, artikel terkait, Calendly embed, CTA konsultasi |

Proses kerja: `frontend/src/lib/service-process.ts`

### Blog

| Fitur | File |
|-------|------|
| List + filter kategori + pagination | `blog/page.tsx` |
| Estimasi waktu baca | `lib/read-time.ts` |
| Content pillars V2 | `lib/content-pillars.ts` |
| Internal linking dinamis | `blog/[slug]/page.tsx` |
| Author & tanggal publish | Dari DB |

**Pillar kategori V2:**
- Tech Stack Indonesia
- Scaling Proyek Software
- Saran Teknologi Startup
- Insight Kasus

### Tentang & Tim

| Halaman | Fitur |
|---------|-------|
| `/about` | Story, mission, vision, values, achievements dari `SiteSettings.aboutContent` (JSON) |
| `/team` | Profil tim dari DB, empty state, schema `Person` JSON-LD |

### Kontak & Thank You

| Halaman | Fitur |
|---------|-------|
| `/contact` | Info kontak dari settings, form multi-step, Calendly |
| `/thank-you` | Konfirmasi 24 jam, auto-redirect ke `/blog` setelah 5 detik |

### Halaman P2 (empty state, bukan fake data)

| Halaman | Perilaku |
|---------|----------|
| `/portfolio` | Kosong sampai ada proyek real |
| `/case-studies` | Empty state + link ke blog |
| `/testimonials` | Kosong sampai ada testimoni real |
| `/resources` | Dari `SiteSettings.resources` JSON |
| `/quiz` | Rekomendasi dari layanan aktif di DB |
| `/careers` | Dari DB, field `level` & `benefits` |

### Halaman lain (sudah ada, production-ready)

- `/faq` — FAQ dari DB + FAQPage schema
- `/terms`, `/privacy` — dari settings legal
- `/sitemap.xml`, `/robots.txt` — auto-generated
- `/admin/*` — dashboard CMS lengkap

---

## 4. Form & Lead Generation

### Form Kontak 3 Langkah (PRD V2 §4.7)

| Step | Field |
|------|-------|
| 1 — Info Kontak | Nama*, Email*, Telepon, Perusahaan |
| 2 — Detail Proyek | Jenis proyek*, Layanan (opsional), Anggaran, Timeline*, Deskripsi 50–500 char* |
| 3 — Konfirmasi | Review data + checkbox consent + link privacy |

**Jenis proyek:** Aplikasi Kustom, Konsultasi IT, Pemeliharaan & Support, Lainnya

**Timeline:** ASAP, 1–3 bulan, 3–6 bulan, Fleksibel

**Anggaran:** Tier IDR (`lib/currency.ts`)

File: `frontend/src/components/forms/MultiStepForm.tsx`

### Backend Lead

| Fitur | Implementasi |
|-------|--------------|
| POST `/api/v1/leads` | Simpan ke `form_submissions` |
| Field `timeline` | Kolom baru di schema |
| Duplicate check | `/leads/check-duplicate` |
| Rate limit | 10 submission/jam |
| Analytics event | `form_submit` + conversion funnel |
| Email user | Auto-reply via SendGrid |
| Email sales | Notifikasi ke `SALES_EMAIL` |

### Komponen interaktif lain

| Komponen | Status |
|----------|--------|
| NewsletterForm | ✅ Subscribe ke DB |
| SolutionQuiz | ✅ Rekomendasi dari layanan DB |
| ExitIntentModal | ✅ Desktop only, trigger top-edge exit, max 1x/session |
| ROICalculator | ✅ Masih ada (halaman terpisah, tidak di homepage) |
| CalendlyEmbed | ✅ Dari `SiteSettings.calendlyUrl` |
| CrispChatLoader | ✅ Dari `SiteSettings.crispWebsiteId` |
| PageTracker | ✅ Analytics events |

---

## 5. SEO & Structured Data

Implementasi berdasarkan `docs/V2/DN-TECH-SEO-GUIDE-V2.md`.

### Meta & Keywords

| Item | File |
|------|------|
| `buildMetadata()` | `lib/seo.ts` |
| Keywords startup Indonesia | `DEFAULT_KEYWORDS`, `PAGE_SEO` |
| Auto-truncate title ≤60, desc ≤160 | `buildMetadata()` |
| Canonical URL | Per halaman |
| Locale `id_ID` | Open Graph |

### JSON-LD Schema

| Schema | Halaman |
|--------|---------|
| `Organization` | Layout publik |
| `LocalBusiness` | Layout publik |
| `WebSite` | Layout publik |
| `Service` | Detail layanan |
| `BlogPosting` | Artikel blog |
| `FAQPage` | FAQ & detail layanan |
| `Person` | Halaman tim |
| `BreadcrumbList` | Blog, layanan, tim |
| `ItemList` | Blog list |

File: `frontend/src/components/seo/JsonLd.tsx`

### SEO dinamis (bukan hardcode)

- Kontak, footer, hero → `SiteSettings`
- Internal links blog → layanan terkait by category
- Content pillars → link generik (bukan slug demo)

---

## 6. Backend & Database

### Schema (`backend/prisma/schema.prisma`)

**Model utama:** User, Service, PortfolioItem, BlogPost, TeamMember, Testimonial, Faq, Career, FormSubmission, SiteSettings, Media, AnalyticsEvent, NewsletterSubscriber, QuizSubmission, dll.

**Field baru / diperbarui:**

| Model | Field |
|-------|-------|
| `SiteSettings` | `homeStats`, `resources`, `heroDescription`, `businessHours` |
| `SiteSettings` | `primaryColor` default `#1E3A8A` |
| `FormSubmission` | `timeline` |
| `Career` | `level`, `benefits` |

### Seed (`backend/prisma/seed.ts`)

- Hanya create **admin user** + **site settings kosong**
- Tidak ada layanan, blog, testimoni, portfolio demo

### Script utilitas

| Script | Perintah | Fungsi |
|--------|----------|--------|
| Bootstrap seed | `npm run db:seed` | Admin + settings kosong |
| Clear demo content | `npm run db:clear-content` | Hapus semua konten, keep admin |
| Prebuild | `npm run build` | Auto `prisma generate` |

File clear: `backend/scripts/clear-content.ts`

### API Routes

| Prefix | Fungsi |
|--------|--------|
| `/api/v1/services` | Layanan publik |
| `/api/v1/blog` | Artikel publik |
| `/api/v1/team` | Tim |
| `/api/v1/faq` | FAQ |
| `/api/v1/settings` | Settings publik |
| `/api/v1/leads` | Submit lead |
| `/api/v1/quiz` | Submit quiz (rekomendasi dari DB) |
| `/api/v1/newsletter` | Subscribe |
| `/api/v1/search` | Pencarian sitewide |
| `/api/v1/admin/*` | CRUD CMS + analytics |

### Keamanan

- JWT auth + RBAC (SuperAdmin, ContentManager, Editor, Viewer)
- bcrypt password hashing
- Helmet, CORS (www + apex), rate limiting
- Trust proxy untuk Nginx (`TRUST_PROXY=1`)
- Validasi Zod di routes

---

## 7. Admin Dashboard (CMS)

Semua halaman admin sudah ada dan mendukung konten real:

| Route | Fungsi |
|-------|--------|
| `/admin/login` | JWT login |
| `/admin/dashboard` | Metrik leads & traffic |
| `/admin/analytics` | Conversion funnel |
| `/admin/services` | CRUD layanan |
| `/admin/portfolio` | CRUD portfolio/studi kasus |
| `/admin/blog` | CRUD blog (draft/published/scheduled) |
| `/admin/team` | CRUD tim |
| `/admin/testimonials` | CRUD testimoni |
| `/admin/faqs` | CRUD FAQ |
| `/admin/careers` | CRUD lowongan (+ level, benefits) |
| `/admin/leads` | Manajemen leads + export CSV |
| `/admin/media` | Upload file |
| `/admin/newsletter` | Daftar subscriber |
| `/admin/quiz` | Submission kuis |
| `/admin/settings` | **Pengaturan situs lengkap** |
| `/admin/users` | Manajemen user |

### Admin Settings — field yang bisa diisi

| Field | Tipe |
|-------|------|
| companyName, tagline, heroDescription | Text |
| companyEmail, phone, address, businessHours | Text |
| homeStats | JSON |
| trustBadges, clientLogos | JSON |
| resources, aboutContent | JSON |
| calendlyUrl, leadMagnetUrl | URL |
| googleAnalyticsId, crispWebsiteId | Text |
| termsContent, privacyContent | HTML |

File: `frontend/src/app/admin/settings/page.tsx`

---

## 8. Integrasi & Email

| Integrasi | Status | Konfigurasi |
|-----------|--------|-------------|
| SendGrid | ✅ Kode siap | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` |
| Sales notification | ✅ | `SALES_EMAIL=sales@dntech.id` |
| Welcome email lead | ✅ | Link ke `/blog` (bukan fake case studies) |
| Newsletter welcome | ✅ | |
| Quiz follow-up | ✅ | |
| Google Analytics | ✅ Loader | `SiteSettings.googleAnalyticsId` |
| Crisp Chat | ✅ Loader | `SiteSettings.crispWebsiteId` |
| Calendly | ✅ Embed | `SiteSettings.calendlyUrl` |

File email: `backend/src/services/EmailService.ts`

---

## 9. Infrastruktur & Deploy

| Item | Status |
|------|--------|
| PostgreSQL production | ✅ |
| Docker Compose (dev) | ✅ |
| PM2 (`dntech-api`, `dntech-web`) | ✅ Dokumentasi |
| Nginx reverse proxy | ✅ CORS www/apex, trust proxy |
| `NEXT_PUBLIC_API_URL` build-time | ✅ |
| Panduan deploy | `docs/DEPLOYMENT-PRODUCTION.md` |
| Dokumentasi proyek | `docs/PROJECT-OVERVIEW.md` |
| Dokumentasi V2 specs | `docs/V2/*.md` |

### Production domains

| Service | URL |
|---------|-----|
| Website | `https://dntech.id` / `https://www.dntech.id` |
| API | `https://api.dntech.id` |
| Admin | `https://dntech.id/admin/login` |

---

## 10. File & Modul Baru

| File | Fungsi |
|------|--------|
| `frontend/src/lib/settings.ts` | Helper fetch public settings |
| `frontend/src/lib/read-time.ts` | Estimasi waktu baca artikel |
| `frontend/src/lib/service-process.ts` | 5 langkah proses layanan V2 |
| `frontend/src/hooks/useExitIntent.ts` | Hook exit intent V3 |
| `frontend/src/components/branding/LogoLight.tsx` | Logo navbar/light background |
| `frontend/src/components/branding/LogoDark.tsx` | Logo hero/footer/dark background |
| `frontend/src/components/interactive/ExitIntentModalLoader.tsx` | Lazy client loader untuk modal exit intent |
| `frontend/src/components/interactive/ThankYouRedirect.tsx` | Auto-redirect thank-you → blog |
| `backend/scripts/clear-content.ts` | Hapus konten demo dari DB |
| `docs/PROJECT-OVERVIEW.md` | Dokumentasi lengkap proyek |
| `docs/V2/` | PRD, Design System, SEO Guide V2 |

---

## 11. Yang Sengaja Tidak Di-hardcode

Sesuai kebijakan production — konten ini **harus diisi via Admin**, bukan di kode:

| Konten | Sumber |
|--------|--------|
| Tagline & hero description | Admin → Settings |
| Statistik beranda | Admin → Settings → homeStats JSON |
| Trust badges / differentiators | Admin → Settings |
| Logo klien | Admin → Settings |
| Layanan | Admin → Services |
| Blog artikel | Admin → Blog |
| Tim & foto | Admin → Team |
| FAQ | Admin → FAQs |
| Testimoni | Admin → Testimonials |
| Portfolio / studi kasus | Admin → Portfolio |
| Sumber daya / lead magnet | Admin → Settings → resources |
| About (story, mission, vision) | Admin → Settings → aboutContent |
| Info kontak | Admin → Settings |

---

## 12. Implementasi V3

Implementasi berdasarkan dokumen di `docs/v3/`.

### Scope V3 yang sudah masuk ke codebase

| Area | Status | File |
|------|--------|------|
| Exit intent hook | ✅ | `frontend/src/hooks/useExitIntent.ts` |
| Exit modal UI | ✅ | `frontend/src/components/interactive/ExitIntentModal.tsx` |
| Lazy loader modal | ✅ | `frontend/src/components/interactive/ExitIntentModalLoader.tsx` |
| Logo navbar | ✅ | `frontend/src/components/branding/LogoLight.tsx`, `Header.tsx` |
| Logo hero/footer | ✅ | `frontend/src/components/branding/LogoDark.tsx`, homepage, `Footer.tsx` |
| Mobile nav close on link click | ✅ | Sudah ada dan dipertahankan di `Header.tsx` |
| Form accessibility | ✅ | `Input.tsx`, `MultiStepForm.tsx` |
| Env rollback modal | ✅ | `NEXT_PUBLIC_ENABLE_EXIT_MODAL=false` |

### Perilaku exit intent saat ini

- Modal hanya muncul di desktop/non-touch.
- Trigger utama: mouse keluar dari viewport lewat sisi atas (`clientY <= 0`).
- Modal hanya muncul 1x per session via `sessionStorage.exitIntentModalShown`.
- `beforeunload` dan `visibilitychange` dipakai untuk menandai sesi, bukan memaksa render modal saat tab benar-benar ditutup.
- Close button memindahkan fokus ke modal saat terbuka dan restore fokus setelah dismiss.

### Verifikasi terakhir

| Check | Hasil | Catatan |
|-------|-------|---------|
| `npm run build` frontend | ✅ Sukses | Perlu network saat build karena `next/font/google` mengambil Inter |
| ESLint file V3 | ✅ Tidak ada error | Ada warning lama React Hook Form `watch()` di `MultiStepForm` |
| `npm run lint` seluruh repo | ⚠️ Belum hijau | Error lama `react-hooks/set-state-in-effect` di admin/AuthContext |
| Manual QA browser | ⏳ Belum dicatat | Perlu test Chrome/Safari/Firefox + mobile |
| Lighthouse | ⏳ Belum dicatat | Belum ada angka lab audit resmi |

---

## 13. Audit Performa: Kenapa Web Lambat

Audit ini adalah hasil review kode dan build, bukan hasil Lighthouse lab run. Temuan diurutkan dari yang paling mungkin terasa oleh user.

### Ringkasan penyebab utama

| Prioritas | Temuan | Dampak |
|-----------|--------|--------|
| P0 | Homepage SSR menunggu beberapa request API | TTFB lambat jika API/DB/network lambat |
| P0 | `settings` di-fetch lebih dari sekali | Request duplikat di homepage dan client loader |
| P1 | Client loader melakukan request tambahan setelah hydration | Network/main-thread terasa ramai setelah halaman tampil |
| P1 | Third-party scripts GA/Crisp dimuat dari data settings | Bisa menambah JS, DNS lookup, dan blocking kerja browser |
| P1 | Beberapa gambar masih pakai `<img>` biasa | Tidak otomatis optimized/sized oleh Next Image |
| P2 | Header search tidak debounce | Bisa spam API saat user mengetik |
| P2 | Build warning multiple lockfiles/root inference | Bukan runtime, tapi bisa bikin deploy/build tidak stabil |

### Detail temuan

#### 1. Homepage menunggu 4 API request sebelum render

File: `frontend/src/app/(public)/page.tsx`

Homepage menjalankan:

- `GET /services`
- `GET /blog?pageSize=4`
- `GET /team`
- `GET /settings`

Semua request memang diparalelkan dengan `Promise.all`, tapi halaman server-render tetap harus menunggu semuanya selesai untuk menghasilkan HTML. Kalau backend/API lambat, database cold, VPS kecil, atau API domain lewat network eksternal, user akan merasakan halaman awal lambat.

Rekomendasi:

- Jadikan data non-kritis seperti team/blog preview sebagai komponen streaming/Suspense.
- Kurangi jumlah API homepage di first render.
- Cache settings/service/blog di layer backend atau gunakan revalidate lebih panjang untuk konten jarang berubah.

#### 2. `settings` di-fetch berulang

File terkait:

- `frontend/src/app/(public)/layout.tsx`
- `frontend/src/app/(public)/page.tsx`
- `frontend/src/components/interactive/CrispChatLoader.tsx`
- `frontend/src/components/seo/AnalyticsLoader.tsx`

Layout publik sudah fetch `getPublicSettings()`. Homepage juga fetch `/settings` lagi di `getHomeData()`. Setelah halaman hydrate, `CrispChatLoader` dan `AnalyticsLoader` juga fetch `/settings` dari browser kalau env ID tidak tersedia.

Dampak:

- Request duplikat ke endpoint yang sama.
- TTFB homepage ikut tergantung settings.
- Setelah load, browser masih melakukan request tambahan hanya untuk mendapatkan GA/Crisp ID.

Rekomendasi:

- Pass `settings.googleAnalyticsId` dan `settings.crispWebsiteId` dari server layout ke client loader.
- Hindari fetch `/settings` lagi di homepage jika data sudah ada di layout, atau buat endpoint home aggregate.
- Simpan public settings di cache memory backend/Redis jika traffic naik.

#### 3. Tracking dan chat menambah request setelah hydration

File terkait:

- `frontend/src/components/common/PageTracker.tsx`
- `frontend/src/components/seo/AnalyticsLoader.tsx`
- `frontend/src/components/interactive/CrispChatLoader.tsx`

Saat halaman publik dibuka, browser dapat melakukan:

- `POST /analytics/track`
- `GET /settings` untuk GA
- `GET /settings` untuk Crisp
- request script GA dari Google
- request script Crisp dari Crisp CDN

Ini tidak selalu memblokir HTML awal, tetapi bisa membuat halaman terasa berat di koneksi lambat atau device low-end.

Rekomendasi:

- Load GA/Crisp dengan delay setelah idle (`requestIdleCallback`) atau setelah interaksi.
- Pakai env var build-time untuk GA/Crisp jika ID jarang berubah.
- Batch/defer analytics internal.

#### 4. Gambar belum seluruhnya pakai Next Image

File yang masih memakai `<img>`:

- `frontend/src/app/(public)/blog/[slug]/page.tsx`
- `frontend/src/app/(public)/team/page.tsx`
- `frontend/src/components/layout/TeamSpotlight.tsx`
- `frontend/src/app/(public)/case-studies/[slug]/page.tsx`
- `frontend/src/app/admin/media/page.tsx`

Dampak:

- Browser tidak dapat automatic image optimization dari Next.
- Risiko CLS jika width/height/aspect ratio tidak stabil.
- Risiko bandwidth besar jika gambar upload tidak dikompresi.

Rekomendasi:

- Migrasi gambar publik ke `next/image`.
- Tambahkan `remotePatterns` untuk domain upload/API production, bukan hanya localhost.
- Pastikan gambar admin/upload diproses dengan ukuran thumbnail.

#### 5. `next/font/google` butuh network saat build

File: `frontend/src/app/layout.tsx`

Build pernah gagal ketika sandbox tidak punya akses ke `fonts.googleapis.com`. Setelah network diizinkan, build sukses. Ini bukan penyebab runtime lambat karena font di-bundle saat build, tetapi bisa membuat deploy VPS gagal kalau outbound network dibatasi.

Rekomendasi:

- Pastikan VPS bisa akses Google Fonts saat build, atau
- pindahkan Inter ke local font/self-host agar build tidak bergantung network eksternal.

#### 6. Header search belum debounce

File: `frontend/src/components/common/Header.tsx`

Setiap perubahan input search dengan panjang query >= 2 memanggil `/search`. Ini bukan masalah first load, tetapi bisa membuat API terasa berat saat user mengetik cepat.

Rekomendasi:

- Tambahkan debounce 250-400ms.
- Cancel request sebelumnya dengan `AbortController`.

#### 7. Build warning root lockfile

Saat build, Next menampilkan warning bahwa workspace root terdeteksi dari lockfile di `/Users/dozer-entropi/package-lock.json`, sementara project juga punya `frontend/package-lock.json`.

Dampak:

- Bukan runtime issue.
- Bisa bikin cache/build path membingungkan di local/CI.

Rekomendasi:

- Set `turbopack.root` di `frontend/next.config.ts`, atau
- rapikan lockfile di parent directory jika tidak dipakai.

### Prioritas optimasi berikutnya

| Urutan | Action | Ekspektasi impact |
|--------|--------|-------------------|
| 1 | Hilangkan duplicate `/settings` fetch di layout/home/loader | TTFB dan post-hydration network lebih ringan |
| 2 | Buat endpoint agregat homepage atau cache server-side | Homepage lebih cepat dan stabil |
| 3 | Defer GA/Crisp sampai idle/interaksi | Main thread dan network awal lebih ringan |
| 4 | Migrasi gambar publik ke `next/image` | LCP/CLS/bandwidth lebih baik |
| 5 | Tambahkan debounce search | Mengurangi beban API saat search |
| 6 | Self-host font Inter atau pastikan outbound build | Deploy lebih reliable |

---

## 14. Checklist Verifikasi Cepat

Setelah deploy, pastikan:

- [ ] `npx prisma db push` sukses (field `timeline`, `level`, `benefits`)
- [ ] `npm run build` backend & frontend sukses
- [ ] Homepage tanpa gradient, nav 5 item
- [ ] Form kontak 3 langkah + consent
- [ ] Tidak ada email/telepon fake di footer
- [ ] `/case-studies` empty state (bukan data demo)
- [ ] Login admin → isi settings & konten
- [ ] Exit modal hanya muncul desktop saat mouse keluar dari top edge
- [ ] Exit modal tidak muncul ulang setelah refresh di session yang sama
- [ ] Navbar logo tidak punya background PNG hitam
- [ ] Network tab: tidak ada request `/settings` berulang yang tidak perlu
- [ ] Lighthouse mobile + desktop dicatat setelah deploy

---

## 15. Referensi Dokumen

| Dokumen | Isi |
|---------|-----|
| [`docs/PROJECT-OVERVIEW.md`](./PROJECT-OVERVIEW.md) | Overview teknis proyek |
| [`docs/V2/README-V2-CHANGES.md`](./V2/README-V2-CHANGES.md) | Perubahan v1 → v2 |
| [`docs/V2/DN-TECH-PRD-V2.md`](./V2/DN-TECH-PRD-V2.md) | Product requirements |
| [`docs/V2/DN-TECH-DESIGN-SYSTEM-V2.md`](./V2/DN-TECH-DESIGN-SYSTEM-V2.md) | Design system |
| [`docs/V2/DN-TECH-SEO-GUIDE-V2.md`](./V2/DN-TECH-SEO-GUIDE-V2.md) | SEO guide |
| [`docs/v3/00-START-HERE.md`](./v3/00-START-HERE.md) | Paket dokumen V3 |
| [`docs/v3/DN-TECH-PRD-V3.md`](./v3/DN-TECH-PRD-V3.md) | Refinement PRD V3 |
| [`docs/v3/DN-TECH-V3-IMPLEMENTATION-GUIDE.md`](./v3/DN-TECH-V3-IMPLEMENTATION-GUIDE.md) | Panduan implementasi V3 |
| [`docs/DEPLOYMENT-PRODUCTION.md`](./DEPLOYMENT-PRODUCTION.md) | Panduan deploy |

---

*Dokumen ini hanya mencatat implementasi teknis yang sudah selesai. Untuk konten marketing (artikel blog, foto tim, GA4 setup), lihat checklist operasional di `docs/V2/README-V2-CHANGES.md`.*
