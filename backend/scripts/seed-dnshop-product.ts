/**
 * Seed dnShop Finance product page.
 * Source: company-wiki/docs/products/dnShopee/
 * Run: npx tsx scripts/seed-dnshop-product.ts
 */
import { prisma, upsertProduct } from './product-seed-shared';

const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Gratis',
    icon: 'gift',
    tagline: 'Dashboard seller Shopee',
    popular: false,
    featured: false,
    pricing: { amount: 0, currency: 'IDR', billingPeriod: 'forever', description: '100 transaksi lifetime · dashboard only' },
    features: ['Dashboard penjualan 7d/30d', 'Order & product sync', 'Laporan dasar', '1 toko Shopee', 'Mock mode tanpa partner key'],
    cta: { label: 'Mulai Gratis', url: 'https://shop.dntech.id/', type: 'trial' },
  },
  {
    id: 'starter',
    name: 'Starter',
    icon: 'rocket',
    tagline: 'Seller UMKM aktif',
    popular: true,
    featured: true,
    pricing: { amount: 149000, currency: 'IDR', billingPeriod: 'per bulan', description: 'Pembukuan + 50 entri jurnal/bulan' },
    features: [
      'Everything di Gratis +',
      'Pembukuan SAK EMKM (CoA + journal)',
      '50 entri jurnal per bulan',
      'P&L & Balance Sheet',
      'Tax PPh/PPN + e-Faktur XML',
      'Bank reconciliation CSV',
    ],
    cta: { label: 'Upgrade ke Starter', url: 'https://shop.dntech.id/', type: 'trial' },
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: 'star',
    tagline: 'Multi-toko & unlimited journal',
    popular: false,
    featured: false,
    pricing: { amount: 249000, currency: 'IDR', billingPeriod: 'per bulan', description: 'Unlimited journal · multi-toko · advanced reports' },
    features: [
      'Everything di Starter +',
      'Unlimited journal entries',
      'Multi-toko dashboard agregat',
      'Advanced reports + CSV/PDF export',
      'Webhook Shopee live + income sync',
      'Priority email support',
    ],
    cta: { label: 'Pilih Pro', url: 'https://shop.dntech.id/?plan=pro', type: 'trial' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: 'building',
    tagline: 'Agency & accountant desk',
    popular: false,
    featured: false,
    pricing: { amount: null, currency: 'IDR', billingPeriod: 'custom', description: 'Multi-seat · white-label · custom integration' },
    features: [
      'Everything di Pro +',
      'Multi-seat accountant desk',
      'Client management',
      'Custom CoA templates',
      'API access unlimited',
      'Dedicated onboarding',
    ],
    cta: { label: 'Hubungi Sales', url: 'https://calendly.com/dntech/demo', type: 'demo' },
  },
];

const FEATURES = [
  {
    category: 'Shopee Integration',
    icon: 'shopping-cart',
    features: [
      { name: 'OAuth 2.0 + Live API', description: 'Koneksi toko Shopee resmi dengan webhook HMAC verified' },
      { name: 'Order & Income Sync', description: 'Cron WIB, cursor pagination, auto-journal dari settlement' },
      { name: 'Multi-toko Dashboard', description: 'Agregat penjualan dari beberapa toko dalam satu view' },
      { name: 'Product & Inventory', description: 'Low stock alert, CSV import, return tracking' },
    ],
  },
  {
    category: 'Pembukuan Bonus Seller',
    icon: 'book-open',
    features: [
      { name: 'Chart of Accounts SAK EMKM', description: '45 akun template + custom CoA' },
      { name: 'Journal & General Ledger', description: 'Entri manual, reverse, bulk CSV import' },
      { name: 'Financial Statements', description: 'Trial balance, P&L, balance sheet, audit PDF' },
      { name: 'Onboarding Wizard', description: 'Setup pembukuan step-by-step untuk seller baru' },
    ],
  },
  {
    category: 'Tax & Compliance',
    icon: 'file-text',
    features: [
      { name: 'PPh 21 & PPN Engine', description: 'Kalkulasi pajak otomatis dari transaksi' },
      { name: 'e-Faktur XML Export', description: 'Generate e-Faktur dari data jurnal' },
      { name: 'Tax Reports', description: 'Laporan pajak periodik siap submit' },
    ],
  },
  {
    category: 'Ops & Observability',
    icon: 'activity',
    features: [
      { name: 'Realtime Dashboard', description: 'Socket.io updates + charts 7d/30d/custom' },
      { name: 'Email Notifications', description: 'HTML templates, OTP, bounce webhook' },
      { name: 'Tier Enforcement', description: 'API-level gating Free/Starter/Pro/Enterprise' },
      { name: 'UI2 Ops Desk', description: 'Dark/light theme, wizard, upsell banners' },
    ],
  },
];

async function main() {
  console.log('Seeding dnShop Finance product...');

  const product = await upsertProduct({
    name: 'dnShop Finance',
    slug: 'dnshop-finance',
    category: 'FinTech',
    displayOrder: 3,
    description:
      'Financial dashboard & pembukuan untuk seller Shopee Indonesia. Sync order, settlement, dan pajak otomatis — plus bonus pembukuan SAK EMKM tanpa aplikasi akuntansi terpisah.',
    data: {
      tagline: 'Dashboard Shopee + Pembukuan. Satu Platform.',
      longFormContent: [
        '## Financial Dashboard untuk Seller Shopee',
        '',
        'dnShop Finance menggabungkan **dashboard penjualan Shopee** dengan **pembukuan bonus seller** — CoA SAK EMKM, journal, GL, P&L, balance sheet, semua dalam satu akun.',
        '',
        '**v2.1 SOPI go-live** — live OAuth, webhook HMAC, income sync, tier enforcement, onboarding wizard, dan UI2 ops desk sudah implemented.',
        '',
        'Prod: `https://shop.dntech.id` · API: `https://api.shop.dntech.id`',
      ].join('\n'),
      status: 'active',
      featured: true,
      showOnHomepage: true,
      launchStatus: 'launched',
      freemiumEnabled: true,
      freeLimit: '100 transaksi lifetime',
      trialDays: 14,
      customerCount: 'Beta UAT',
      pricingTiers: PRICING_TIERS,
      features: FEATURES,
      integrations: [
        { name: 'Shopee Open API', category: 'Marketplace', description: 'OAuth + webhook + income sync', status: 'available' },
        { name: 'Jurnal', category: 'Accounting', description: 'Export journal sync (v2.2 roadmap)', status: 'coming_soon' },
        { name: 'MYOB', category: 'Accounting', description: 'Multi-system sync (v2.2 roadmap)', status: 'coming_soon' },
      ],
      useCases: [
        {
          id: 'solo-seller',
          segment: 'Seller Solo / UMKM',
          icon: 'user',
          description: 'Pantau penjualan harian, settlement, dan pajak — tanpa spreadsheet manual.',
          uniqueFeatures: ['Free tier dashboard', 'Onboarding wizard', 'Tax auto-calculation'],
          cta: { label: 'Mulai Gratis', url: 'https://shop.dntech.id/' },
        },
        {
          id: 'multi-store',
          segment: 'Multi-toko',
          icon: 'store',
          description: 'Agregat beberapa toko Shopee + pembukuan terpusat.',
          uniqueFeatures: ['Multi-store dashboard', 'Unified CoA', 'Cross-store reports'],
          cta: { label: 'Lihat Demo', url: 'https://calendly.com/dntech/demo' },
        },
        {
          id: 'accountant',
          segment: 'Accountant / Agency',
          icon: 'calculator',
          description: 'Kelola pembukuan banyak klien seller dari satu ops desk.',
          uniqueFeatures: ['Multi-seat', 'Client management', 'Audit PDF export'],
          cta: { label: 'Hubungi Sales', url: '/contact?product=dnshop-finance' },
        },
      ],
      primaryCta: { label: 'Coba Gratis', url: 'https://shop.dntech.id/', type: 'trial', color: 'blue', size: 'lg' },
      secondaryCtas: [
        { label: 'Lihat Pricing', url: '#pricing', type: 'link' },
        { label: 'Book Demo', url: 'https://calendly.com/dntech/demo', type: 'demo' },
      ],
      demoUrl: 'https://calendly.com/dntech/demo',
      seoTitle: 'dnShop Finance — Dashboard Shopee + Pembukuan untuk Seller Indonesia',
      seoDescription: 'Sync order Shopee, settlement, pajak, dan pembukuan SAK EMKM dalam satu platform. Free tier tersedia. Prod: shop.dntech.id',
      keywords: 'dashboard shopee, pembukuan seller, software akuntansi shopee, dnShop Finance, laporan penjualan shopee',
      faq: [
        {
          question: 'Apakah ini aplikasi akuntansi terpisah?',
          answer: 'Tidak. Pembukuan adalah bonus di akun seller — dashboard Shopee tetap fokus utama. Anda tidak perlu install aplikasi akuntansi lain.',
        },
        {
          question: 'Bisa pakai tanpa kredensial Shopee partner?',
          answer: 'Ya. Mock mode aktif otomatis jika partner key kosong — cocok untuk demo dan UAT.',
        },
        {
          question: 'Tier Free bisa buat jurnal?',
          answer: 'Free tier = dashboard only. Pembukuan (journal) tersedia dari tier Starter ke atas.',
        },
      ],
      roadmap: [
        { quarter: 'Q3 2026', status: 'launched', features: [{ name: 'v2.1 SOPI Go-live', description: 'Live OAuth, webhook, tier enforcement, UI2' }] },
        { quarter: 'Q4 2026', status: 'planned', features: [{ name: 'v2.2 Accounting Depth', description: 'Cash flow, COGS inventori, sync Jurnal/MYOB' }] },
        { quarter: 'Q1 2027', status: 'planned', features: [{ name: 'v3.0 Multi-marketplace', description: 'Tokopedia + unified dashboard' }] },
      ],
    },
  });

  console.log(`dnShop Finance product seeded: ${product.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
