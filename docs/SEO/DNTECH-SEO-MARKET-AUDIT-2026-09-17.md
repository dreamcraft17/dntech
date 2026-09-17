---
owner: Dozer
status: audited-and-remediated
last_reviewed: 2026-09-17
scope: dntech.id public website
---

# DN Tech — SEO dan Market Audit

## Executive summary

### Remediation status — 2026-09-17

- [x] SEO host fallback disatukan ke `SITE_URL` dengan fallback production `https://dntech.id`.
- [x] Static sitemap entries tidak lagi mengiklankan `lastModified` palsu pada setiap request.
- [x] Dynamic sitemap entries difilter dari slug kosong dan hanya memakai timestamp konten bila tersedia.
- [x] Homepage title/meta description diperbaiki; homepage checker naik dari 79 menjadi 97.
- [x] Metadata canonical/description ditambahkan ke careers, privacy, terms, dan testimonials.
- [ ] Live DNS, GSC coverage, WAF, dan Core Web Vitals masih memerlukan verifikasi production.

- Homepage baseline sebelum remediation mendapat **79/100**; setelah remediation menjadi **97/100**. Struktur H1/hierarchy, internal links, word count, viewport, title, dan meta description kini lolos checker.
- Risiko localhost pada `sitemap.ts` dan `robots.ts` sudah diperbaiki dengan memakai `SITE_URL` bersama. Tetap lakukan smoke test production karena environment deployment adalah source of truth terakhir.
- Sitemap tetap mencakup route statis dan route dinamis services/products/blog/case studies. Sebelum submit ke GSC, validasi bahwa semua URL benar-benar publik, canonical, HTTP 200, dan bukan halaman tipis/duplikat.
- Homepage sudah memiliki JSON-LD Organization, WebSite, dan FAQ; halaman detail service/product/blog/case study juga memiliki schema relevan. Breadcrumb schema tersedia pada sebagian halaman detail, tetapi coverage perlu divalidasi per template.
- Dari segmentasi berbasis asumsi, target paling kuat untuk DN Tech adalah: **startup yang butuh MVP/product engineering**, **perusahaan multi-cabang dengan workflow kompleks**, dan **perusahaan yang butuh integrasi/modernisasi legacy**. Pesan “developer murah untuk semua kebutuhan” sebaiknya hanya menjadi fallback, bukan positioning utama.

## Audit scope dan metode

Scope meliputi homepage dan public route architecture pada `dntech/frontend`, metadata, sitemap, robots, canonical, JSON-LD, internal linking, content structure, dan segmentasi pasar layanan.

Metode:

- source audit terhadap Next.js route dan SEO helpers;
- production build dan lint;
- `seo_checker.py` pada HTML homepage hasil build;
- segment scoring `market-research` profile `services` terhadap lima kriteria Kotler;
- dokumentasi Google Search Central sebagai sumber utama untuk crawling, indexing, title/snippet, sitemap, dan structured data.

Tidak ada angka TAM/SAM/SOM yang dikutip karena belum ada input pasar yang bersumber dan tervalidasi. Skor segmentasi di bawah adalah hipotesis operasional untuk menentukan eksperimen awal, bukan ukuran pasar.

## Technical SEO findings

| Issue | Impact | Evidence | Fix | Priority |
|---|---|---|---|---|
| Production URL fallback dapat menjadi `http://localhost:3000` | High | `frontend/src/app/sitemap.ts:4` dan `robots.ts:6` | Set `NEXT_PUBLIC_SITE_URL=https://dntech.id` atau canonical host final di production; tambahkan smoke test terhadap generated sitemap/robots | P1 |
| Sitemap menggabungkan static dan API-driven dynamic URLs | Medium | `frontend/src/app/sitemap.ts` memuat services, products, blog, case studies dari API | Audit setiap output URL untuk 200, canonical, indexability, dan konten unik; keluarkan item kosong/draft | P1 |
| `lastModified` static routes memakai `new Date()` | Medium | `frontend/src/app/sitemap.ts` | Gunakan timestamp perubahan konten yang bermakna; jangan mengklaim halaman berubah setiap request | P2 |
| Live production response belum terverifikasi | High | Environment audit tidak dapat resolve DNS publik dari shell | Jalankan `curl -I` dari jaringan publik dan Test live URL di GSC untuk `/`, `/sitemap.xml`, `/robots.txt` | P1 |
| Redirect, TLS, host canonical, dan WAF belum terukur | High | Tidak tersedia akses live/CDN/GSC | Cek HTTP→HTTPS, www/non-www, 3xx chain, bot access, dan canonical terpilih | P1 |

## On-page SEO findings

| Issue | Impact | Evidence | Fix | Priority |
|---|---|---|---|---|
| Homepage title 61 karakter | Medium | `seo_checker.py`: `Software Development Indonesia untuk Startup & UMKM \| DN Tech` | Uji varian lebih ringkas, misalnya `Software Development Indonesia untuk Bisnis \| DN Tech`; jangan mengorbankan intent utama | P2 |
| Homepage meta description ter-render 108 karakter | Medium | `seo_checker.py`; metadata juga dapat dipengaruhi public settings CMS | Isi description 140–160 karakter yang menjelaskan layanan, target, dan CTA; cek setting SEO CMS sebagai source of truth | P1 |
| Beberapa halaman metadata hanya punya title | Medium | `terms/page.tsx`, `privacy/page.tsx`, `careers/page.tsx` mendefinisikan metadata minimal | Tambahkan description/canonical/noindex sesuai tujuan halaman; legal tidak perlu dipaksa mengejar keyword | P2 |
| Homepage alt checker menemukan satu image tanpa alt | Low | `HomeHero.tsx` memakai hero background dekoratif dengan `alt=""` dan `aria-hidden` | Pertahankan `alt=""` untuk gambar dekoratif; jangan menambah alt keyword palsu. Audit image lain yang benar-benar informatif | P3 |
| Dynamic detail pages bergantung pada data API | Medium | `services/[slug]`, `products/[slug]`, `blog/[slug]` mengambil metadata dari API | Pastikan fallback 404 untuk slug invalid, metadata unik, dan draft tidak masuk sitemap | P1 |

## Content dan market findings

### Segment scoring

Scoring memakai profile `services`, bobot: measurable 15%, substantial 25%, accessible 25%, differentiable 20%, actionable 15%. Nilai input adalah hipotesis dari kemampuan produk, route/channel yang ada, dan positioning saat ini; validasi dengan lead/win-loss wajib dilakukan.

| Segmen | Composite | Verdict | Keputusan awal |
|---|---:|---|---|
| Startup Indonesia yang butuh MVP atau product engineering | 77.6 | TARGET | Hero/service page utama; tawarkan scope, quote, timeline, dan founder/tech review |
| Perusahaan multi-cabang dengan workflow HR/payroll kompleks | 76.3 | TARGET | Gunakan dnPeople sebagai proof/product wedge dan landing khusus workflow |
| Perusahaan yang membutuhkan integrasi dan modernisasi sistem legacy | 70.5 | TARGET | Buat halaman integration/API/modernization dengan contoh risiko dan proses discovery |
| UMKM yang butuh aplikasi operasional sederhana | 68.5 | TARGET | Layani melalui paket scoped/templatized agar margin dan scope tetap terkendali |
| Klien umum yang mencari developer murah tanpa kebutuhan spesifik | 63.9 | WATCH | Jangan jadikan headline; kualifikasi berdasarkan problem, budget, dan timeline |

### Market recommendation

DN Tech sebaiknya dipasarkan sebagai **partner software engineering yang membantu bisnis Indonesia mengubah workflow penting menjadi software yang bisa dipakai dan dipelihara**, bukan sebagai vendor “bisa bikin apa saja”. Empat message pillars yang layak diuji:

1. **Ship MVP dengan scope dan timeline yang terlihat.**
2. **Modernisasi dan integrasi sistem yang sudah berjalan.**
3. **Workflow operasional multi-cabang yang butuh kontrol lebih baik.**
4. **Produk internal/first-party seperti dnPeople sebagai bukti pemahaman domain.**

Setiap segmen perlu halaman dengan satu intent, satu CTA, bukti proses yang konkret, dan qualification form. Hindari membuat halaman kota/industri yang hanya mengganti kata kunci tanpa konten dan bukti lokal.

## Schema and entity findings

- `JsonLd.tsx` sudah menyediakan Organization, LocalBusiness, WebSite, FAQPage, BreadcrumbList, Article, Service, dan Product schema.
- Homepage harus konsisten memakai nama entitas `DN Tech`, URL canonical production, logo yang tersedia, dan contact data yang benar.
- Jangan menambahkan schema yang tidak terlihat/benar di halaman. Validasi JSON-LD melalui Rich Results Test dan Search Console enhancement reports.
- Pastikan `WebSite` site name dan `Organization` tidak berbeda antara CMS, metadata, footer, logo alt, dan schema.

## Provisional health score

Health scorer berbasis check matrix lokal setelah remediation menghasilkan **78.7/100 (grade B, profile SaaS)**. Ini adalah skor provisional, bukan skor live domain: sepuluh check masih warning karena GSC, DNS/HTTP production, Core Web Vitals, dan dynamic API content belum sepenuhnya terukur. Angka **97/100** adalah skor on-page homepage dari static build, bukan skor kesehatan seluruh domain.

Temuan kritis host dan metadata homepage sudah ditutup. Temuan high yang tersisa adalah verifikasi live response, data Core Web Vitals, dan validasi dynamic content.

Data yang masih wajib dikumpulkan:

- PageSpeed Insights mobile/desktop untuk homepage dan template detail;
- GSC Sitemaps, Page indexing, Performance, Core Web Vitals;
- HTTP status/redirect/canonical dari host production;
- Search query dan landing-page data minimal 28 hari;
- lead quality per segmen dan service.

## Prioritized action plan

### P1 — critical/high impact

1. Set dan verifikasi `NEXT_PUBLIC_SITE_URL` pada deployment production; pastikan sitemap, robots, metadata, JSON-LD, dan canonical memakai host yang sama.
2. Buka dan test `/sitemap.xml` serta `/robots.txt` dari jaringan publik; submit sitemap pada property GSC yang benar.
3. Audit output sitemap terhadap 404, redirect, draft, duplicate, `noindex`, dan canonical mismatch.
4. Perbaiki homepage meta description dan cek public SEO settings yang menjadi sumber description aktual.
5. Validasi dynamic service/product/blog/case-study pages dengan URL Inspection dan pastikan slug invalid tidak menghasilkan halaman 200 kosong.

### P2 — high/medium impact

1. Uji title homepage yang lebih ringkas tanpa menghapus kata intent `software development Indonesia`.
2. Tambahkan metadata yang konsisten untuk careers, privacy, dan terms; beri `noindex` hanya bila memang tidak ingin halaman muncul di search.
3. Buat landing page intent untuk startup/product engineering, integration/legacy modernization, dan multi-branch workflow.
4. Tambahkan timestamp konten yang nyata ke dynamic sitemap entries.
5. Hubungkan setiap service/product/blog ke halaman contact, relevant service, dan satu CTA yang dapat diukur.

### Quick wins

1. Submit `sitemap.xml` di GSC dan catat status/last read.
2. Jalankan Rich Results Test pada homepage, service detail, product detail, FAQ, dan blog detail.
3. Pastikan `NEXT_PUBLIC_SITE_URL` pada `.env.example` mendokumentasikan domain production, bukan hanya localhost.
4. Tandai hero background tanpa alt sebagai dekoratif secara eksplisit—kondisi ini sudah benar di `HomeHero.tsx`.

## Acceptance criteria

- [ ] Production sitemap dan robots mengembalikan HTTP 200.
- [ ] Tidak ada URL localhost, preview, HTTP, atau host non-canonical di sitemap.
- [ ] Sitemap berstatus Success pada property GSC `dntech.id`.
- [ ] Homepage title dan description unik, akurat, dan tidak terpotong secara material.
- [ ] Semua halaman public utama memiliki canonical konsisten.
- [ ] Tidak ada public dynamic page kosong/duplikat yang ikut sitemap.
- [ ] JSON-LD valid dan sesuai konten yang terlihat.
- [ ] PageSpeed dan Core Web Vitals diukur, bukan diasumsikan.
- [ ] Segmentasi diuji lewat source, CTA, dan lead quality, bukan hanya opini.

## Sources

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google Search documentation](https://developers.google.com/search/docs)
- [Google structured data overview](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google site names](https://developers.google.com/search/docs/appearance/site-names)
- [Google sitemap build and submit](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

*Generated: 2026-09-17 · DN Tech*
