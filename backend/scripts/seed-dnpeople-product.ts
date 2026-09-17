/**
 * Seed the dnPeople flagship product page — pricing tiers, features, use cases,
 * roadmap, FAQ, and CTAs.
 * Source: dnpeople/docs/PRD/DNPEOPLE-WEBSITE-MARKETING-IMPLEMENTATION-2026-09-17.md
 * and dntech/DNPEOPLE-MARKETING-EXECUTION-PLAN-2026-09-17.md.
 * Updated: 2026-09-17 — replaces the pre-relaunch "HRIS untuk UKM" copy (fabricated
 * savings %, direct bank-transfer claims, unverified competitor comparison table)
 * with the branch-operations/payroll-confidence/people-evidence positioning and the
 * honesty guardrails in the execution plan §10 (no unverified savings, no
 * auto-transfer/e-filing/native-app claims, Conditional features labeled as such).
 * Pricing mirrors dnpeople/frontend/src/lib/subscriptionCatalog.ts (TIER_CATALOG) —
 * keep these in sync by hand; there is no shared SSOT between the two repos.
 * Run from backend/: npx tsx scripts/seed-dnpeople-product.ts
 */
import { Prisma } from '@prisma/client';
import { prisma, upsertProduct } from './product-seed-shared';

const PRICING_TIERS = [
  {
    id: 'free', name: 'Gratis', icon: 'gift', tagline: 'Core HR, gratis selamanya',
    popular: false, featured: false,
    pricing: { amount: 0, currency: 'IDR', billingPeriod: 'forever', description: 'Selamanya · s/d 30 karyawan · database karyawan, organisasi, dokumen, kalender, helpdesk' },
    features: [
      'Database karyawan (maks. 30)',
      'Organisasi & org chart',
      'Dokumen & pengumuman',
      'Kalender HR',
      'Helpdesk dasar',
    ],
    cta: { label: 'Buat Akun Gratis', url: 'https://dnpeople.id/signup', type: 'trial' },
  },
  {
    id: 'starter', name: 'Starter', icon: 'rocket', tagline: '1–50 karyawan',
    popular: false, featured: false,
    pricing: { amount: 15000, currency: 'IDR', billingPeriod: 'per karyawan per bulan', description: '1–50 karyawan · minimum Rp150.000/bulan · trial tersedia tanpa kartu kredit' },
    features: [
      'Semua fitur Gratis',
      'Attendance',
      'Leave & izin',
      'Shift',
      'Payroll dasar',
      'Approval inbox',
    ],
    cta: { label: 'Jadwalkan Workflow Audit', url: 'https://dnpeople.id/contact?tier=STARTER', type: 'demo' },
  },
  {
    id: 'professional', name: 'Professional', icon: 'star', tagline: 'Recommended · s/d 300 karyawan',
    popular: true, featured: true,
    pricing: { amount: 20000, currency: 'IDR', billingPeriod: 'per karyawan per bulan', description: 's/d 300 karyawan · trial tersedia tanpa kartu kredit' },
    features: [
      'Semua fitur Starter',
      'Lembur',
      'Payroll lanjutan (BPJS, PPh 21)',
      'Recruitment & onboarding',
      'Performance & training',
      'Competency, IDP & LMS',
    ],
    cta: { label: 'Jadwalkan Workflow Audit', url: 'https://dnpeople.id/contact?tier=PROFESSIONAL', type: 'demo' },
  },
  {
    id: 'business', name: 'Business', icon: 'building', tagline: 'Multi-cabang · volume pricing',
    popular: false, featured: false,
    pricing: { amount: 20000, currency: 'IDR', billingPeriod: 'per karyawan per bulan', description: '301+ karyawan (volume) · multi-cabang' },
    features: [
      'Semua fitur Professional',
      'Multi-cabang',
      'API REST & webhooks',
      'Workflow & security lanjutan',
      'Custom reports',
      'Asset & offboarding',
    ],
    cta: { label: 'Jadwalkan Workflow Audit', url: 'https://dnpeople.id/contact?tier=BUSINESS', type: 'demo' },
  },
  {
    id: 'enterprise', name: 'Enterprise', icon: 'crown', tagline: '500+ karyawan atau kebutuhan multi-company',
    popular: false, featured: false,
    pricing: { amount: null, currency: 'IDR', billingPeriod: 'custom', description: 'Harga khusus · SLA & support dedicated' },
    features: [
      'Semua fitur Business',
      'Multi-company',
      'SSO (Google/Microsoft/SAML) — Conditional, lihat panduan setup',
      'White-label & branding',
      'Account manager & SLA',
    ],
    cta: { label: 'Diskusikan Kebutuhan Anda', url: 'https://dnpeople.id/contact?tier=ENTERPRISE', type: 'demo' },
  },
];

/** Organized around the three outcome pillars, not a generic feature list. */
const FEATURES = [
  {
    category: 'Branch Operations Control', icon: 'building',
    features: [
      { name: 'Organization scope & lokasi', description: 'Konfigurasi struktur cabang dari pusat, berlaku otomatis ke semua lokasi.' },
      { name: 'Shift & jadwal per cabang', description: 'Aturan shift pusat, eksekusi tetap terkendali di lapangan.' },
      { name: 'Approval workflow berjenjang', description: 'Alur persetujuan multi-level yang bisa disesuaikan per cabang.' },
      { name: 'Attendance correction dengan bukti', description: 'Koreksi absensi tercatat dengan evidence, bukan overwrite diam-diam.' },
      { name: 'Import dry-run', description: 'Preview hasil import sebelum data masuk sistem live.' },
    ],
  },
  {
    category: 'Payroll Confidence', icon: 'credit-card',
    features: [
      { name: 'BPJS & PPh 21 built-in', description: 'Perhitungan sesuai regulasi Indonesia.' },
      { name: 'Proration otomatis', description: 'Karyawan masuk/keluar di tengah periode dihitung otomatis.' },
      { name: 'Input lembur terstruktur', description: 'Data overtime masuk ke payroll tanpa rekonsiliasi manual.' },
      { name: 'Preview sebelum finalize', description: 'Payroll bisa diperiksa sebelum dikunci.' },
      { name: 'Finalize atomic + payslip verification', description: 'Setelah finalize, payslip dapat diverifikasi karyawan.' },
    ],
  },
  {
    category: 'People Evidence', icon: 'shield-check',
    features: [
      { name: 'Before/after otomatis', description: 'Setiap perubahan data karyawan tercatat sebelum & sesudah.' },
      { name: 'Actor & reason', description: 'Siapa mengubah apa dan mengapa — tercatat, bukan hilang di WhatsApp.' },
      { name: 'Approval trail berjenjang', description: 'Riwayat persetujuan lengkap per pengajuan.' },
      { name: 'Policy acknowledgement', description: 'Karyawan mengonfirmasi kebijakan, tercatat dengan timestamp.' },
      { name: 'Audit export', description: 'Ekspor evidence untuk kebutuhan audit internal/eksternal.' },
    ],
  },
];

/** Matches dnpeople/frontend/src/lib/marketing/content.ts USE_CASES — no fabricated savings figures. */
const USE_CASES = [
  {
    id: 'multi-branch', segment: 'Multi-cabang', icon: 'building',
    description: 'Retail, F&B multi-outlet, dan jasa lapangan — satu aturan pusat, banyak lokasi. Attendance dan approval tetap konsisten walau tim tersebar di banyak cabang.',
    uniqueFeatures: ['Organization scope & lokasi', 'Shift per cabang', 'Approval berjenjang', 'Attendance correction dengan evidence'],
    cta: { label: 'Audit Workflow Cabang Anda', url: 'https://dnpeople.id/branch-operations' },
  },
  {
    id: 'payroll-finance', segment: 'Payroll & Finance', icon: 'credit-card',
    description: 'Finance dan HR yang butuh angka payroll yang bisa dipercaya — preview sebelum finalize, proration otomatis, dan payslip terverifikasi tanpa rekonsiliasi Excel setiap bulan.',
    uniqueFeatures: ['BPJS & PPh 21 built-in', 'Preview sebelum finalize', 'Finalize atomic', 'Payslip verification'],
    cta: { label: 'Lihat Alur Payroll', url: 'https://dnpeople.id/payroll-confidence' },
  },
  {
    id: 'talent-succession', segment: 'Talent & Succession', icon: 'trending-up',
    description: 'HR yang mulai memikirkan suksesi dan competency gap — data performance dan competency terhubung ke people evidence, siap jadi dasar keputusan talent yang bisa dijelaskan.',
    uniqueFeatures: ['Competency & IDP', 'Performance & training', 'Audit export'],
    cta: { label: 'Lihat Evidence Flow', url: 'https://dnpeople.id/people-evidence' },
  },
];

/** No public testimonials until real quotes with consent (relaunch honesty gate). */
const TESTIMONIALS: never[] = [];

/**
 * No comparison table: the execution plan (§7, §10) explicitly forbids unverified
 * competitor weakness claims and winning purely on price. Bring the conversation to
 * workflow/evidence instead (see the demo talk track), not a numbers table.
 */

/** Only real, currently-tracked work — no dates promised for explicit non-goals
 *  (native app, auto-transfer, e-filing) per the marketing PRD's non-goals list. */
const ROADMAP = [
  {
    quarter: 'Saat ini', status: 'launched', features: [
      { name: 'Branch Operations Control', description: 'Organization scope, lokasi, shift, approval berjenjang, attendance correction, import dry-run.' },
      { name: 'Payroll Confidence', description: 'BPJS/PPh 21, proration, preview, finalize atomic, payslip verification.' },
      { name: 'People Evidence', description: 'Before/after, actor, reason, approval trail, policy acknowledgement, audit export.' },
    ],
  },
  {
    quarter: 'Sedang divalidasi', status: 'in_progress', features: [
      { name: 'Template industri retail/F&B multi-outlet', description: 'Preset shift & approval untuk vertical retail/F&B — draft, sedang divalidasi bersama pilot customer sebelum dipromosikan sebagai tersedia umum.' },
    ],
  },
  {
    quarter: 'Backlog — belum dijadwalkan', status: 'planned', features: [
      { name: '9-box matrix & succession planning', description: 'Menunggu kematangan data performance di akun pilot.' },
    ],
  },
];

const PRIMARY_CTA = { label: 'Jadwalkan Workflow Audit 30 Menit', url: 'https://dnpeople.id/contact', type: 'demo', color: 'blue', size: 'lg' };

const SECONDARY_CTAS = [
  { label: 'Coba Sandbox Gratis', url: 'https://dnpeople.id/demo', type: 'demo' },
  { label: 'Lihat Pricing', url: 'https://dnpeople.id/pricing', type: 'link' },
];

/** Mirrors dnpeople/frontend/src/lib/marketing/content.ts FAQ_ITEMS — same honest
 *  answers, same wording where practical, so DN Tech and dnPeople never contradict
 *  each other on what is Available/Conditional/Roadmap. */
const FAQ = [
  { question: 'Apakah dnPeople punya native Android/iOS?', answer: 'Belum. Saat ini dnPeople adalah aplikasi mobile-first web — dapat diakses dari browser HP tanpa instalasi.' },
  { question: 'Apakah dnPeople melakukan transfer payroll otomatis ke rekening karyawan?', answer: 'Belum. dnPeople menyediakan payroll export (file siap transfer), bukan eksekusi transfer ke bank.' },
  { question: 'Apakah dnPeople melakukan e-filing DJP/BPJS?', answer: 'Belum. Perhitungan BPJS dan PPh 21 tersedia built-in, tetapi pelaporan/e-filing ke DJP dan BPJS masih dilakukan di luar sistem.' },
  { question: 'Apakah dnPeople bisa multi-cabang?', answer: 'Ya — sesuai tier dan konfigurasi. Untuk struktur cabang yang kompleks, kami sarankan discovery call agar scope-nya sesuai kebutuhan Anda.' },
  { question: 'Apakah SSO, absensi biometrik, dan fitur AI tersedia?', answer: 'Conditional — tersedia bergantung provider yang diintegrasikan (identity provider, perangkat biometrik, provider LLM) dan proses UAT bersama tim kami. Panduan setup SSO tersedia di dnpeople.id/docs/sso-setup-guide.' },
  { question: 'Apakah data perusahaan kami terisolasi dari perusahaan lain?', answer: 'Ya — tenant isolation dan backend permission berlaku di setiap layer.' },
  { question: 'Apakah ada trial tanpa kartu kredit?', answer: 'Ya. Starter dan Professional memiliki trial tanpa kartu kredit; Free tier gratis selamanya sampai 30 karyawan.' },
  { question: 'Bagaimana privasi data karyawan kami dijaga?', answer: 'Enkripsi data sensitif, backup harian, audit log immutable, dan pemrosesan berbasis consent sesuai UU PDP.' },
  { question: 'Bisa export data untuk audit atau integrasi?', answer: 'Ya — Excel/PDF untuk laporan inti, API/webhook untuk integrator pada tier Business ke atas.' },
  { question: 'Apakah ada support lokal berbahasa Indonesia?', answer: 'Ya — hubungi info@dntech.id, Senin–Jumat 09:00–18:00 WIB.' },
];

async function main() {
  console.log('Seeding dnPeople product...');

  const data = {
    tagline: 'Aturan HR pusat, tetap rapi di setiap cabang.',
    description:
      'Kelola attendance, approval, payroll, dan people evidence dalam satu alur yang dapat dijelaskan — untuk perusahaan Indonesia 50–300 karyawan dengan banyak cabang. Tanpa rekonsiliasi Excel yang berulang.',
    longFormContent: [
      '## HR Operating System untuk Perusahaan Multi-cabang',
      '',
      '**Aturan pusat, eksekusi cabang tetap terkendali** — Kebijakan shift, lembur, dan approval yang dibuat pusat sering dijalankan berbeda di tiap cabang. dnPeople membuat aturan itu satu sumber kebenaran, dijalankan konsisten di semua lokasi.',
      '',
      '**Payroll yang bisa diperiksa, bukan dibongkar ulang** — Preview payroll sebelum finalize, proration otomatis, dan finalize atomic membuat angka payroll bisa dipercaya finance dan HR, bukan diperiksa ulang tiap ada koreksi.',
      '',
      '**Setiap perubahan HR meninggalkan bukti** — Before/after, actor, dan alasan tercatat otomatis di setiap approval dan perubahan data karyawan — siap diekspor saat audit, bukan tersebar di WhatsApp dan Excel.',
      '',
      '_Soft launch — beta terbatas untuk 10–20 perusahaan Indonesia (50–300 karyawan). Fitur berlabel Conditional bergantung pada provider/konfigurasi yang Anda integrasikan; lihat FAQ untuk detail._',
    ].join('\n'),
    status: 'active' as const,
    featured: true,
    showOnHomepage: true,
    launchStatus: 'launched',
    freemiumEnabled: true,
    freeLimit: '30 karyawan',
    /** No single blanket trial-day count — Starter/Professional trial length differs
     *  and can change via env flag; exact terms are stated per-tier in `pricing.description`. */
    trialDays: null,
    customerCount: 'Soft launch',
    displayOrder: 1,
    pricingTiers: PRICING_TIERS,
    features: FEATURES,
    useCases: USE_CASES,
    testimonials: TESTIMONIALS,
    /** Explicitly cleared: the pre-relaunch seed left fabricated direct-bank-transfer
     *  "integrations" (BCA API, Mandiri API) and an unverified competitor comparison
     *  table in the DB. Both contradict the honesty guardrails above, so upsert must
     *  overwrite them to null rather than silently leaving the stale values in place. */
    integrations: Prisma.JsonNull,
    comparisonTable: Prisma.JsonNull,
    roadmap: ROADMAP,
    primaryCta: PRIMARY_CTA,
    secondaryCtas: SECONDARY_CTAS,
    faq: FAQ,
    demoUrl: 'https://dnpeople.id/demo',
    pricingCalcUrl: 'https://dnpeople.id/pricing',
    seoTitle: 'dnPeople — HRIS Multi-cabang Indonesia',
    seoDescription:
      'HR operating system untuk perusahaan Indonesia 50–300 karyawan dengan banyak cabang. Aturan HR pusat, tetap rapi di setiap cabang — attendance, approval, payroll, dan people evidence dalam satu alur.',
    keywords: 'HRIS multi-cabang Indonesia, software HR multi-cabang, payroll Indonesia yang dapat diaudit, audit trail HR, BPJS, PPh 21',
  };

  const { description, displayOrder, ...productData } = data;

  const product = await upsertProduct({
    name: 'dnPeople',
    slug: 'dnpeople',
    category: 'HRIS / Payroll',
    displayOrder,
    description,
    data: productData,
  });

  console.log(`dnPeople product seeded: ${product.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
