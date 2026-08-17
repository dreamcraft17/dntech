/**
 * Seed Threads Automation product page.
 * Source: company-wiki/docs/products/threads-automation/
 * Run: npx tsx scripts/seed-threads-automation-product.ts
 */
import { prisma, upsertProduct } from './product-seed-shared';

const PRICING_TIERS = [
  {
    id: 'internal',
    name: 'Internal',
    icon: 'lock',
    tagline: 'DN Tech internal use',
    popular: true,
    featured: true,
    pricing: { amount: 0, currency: 'IDR', billingPeriod: 'internal', description: 'Private deployment · ai.dntech.id' },
    features: [
      'AI caption generate (single/batch)',
      'Schedule + media attach (max 4 images)',
      'Bulk CSV import',
      'Auto-publish (cron + Bull + Playwright)',
      'Live/dry-run toggle (default OFF)',
      'Publish history + CSV export',
    ],
    cta: { label: 'Hubungi Tim', url: '/contact?product=threads-automation', type: 'contact' },
  },
  {
    id: 'saas',
    name: 'SaaS',
    icon: 'cloud',
    tagline: 'Untuk agency & creator',
    popular: false,
    featured: false,
    pricing: { amount: 199000, currency: 'IDR', billingPeriod: 'per bulan', description: 'Multi-account · AI credits included' },
    features: [
      'Everything di Internal +',
      'Multi-account management',
      'Brand voice customization',
      'AI cost tracking dashboard',
      'Email notifications (SendGrid)',
      'Priority support',
    ],
    cta: { label: 'Join Waitlist', url: '/contact?product=threads-automation&plan=saas', type: 'contact' },
  },
];

const FEATURES = [
  {
    category: 'AI Content Generation',
    icon: 'sparkles',
    features: [
      { name: 'AI Caption Generate', description: 'Single atau batch generate sesuai brand voice' },
      { name: 'Best-time Suggestion', description: 'Rekomendasi waktu posting optimal' },
      { name: 'Brand Voice Profile', description: 'Custom tone & style per akun' },
      { name: 'AI Cost Tracking', description: 'Monitor biaya LLM per batch/generate' },
    ],
  },
  {
    category: 'Scheduling & Publishing',
    icon: 'calendar',
    features: [
      { name: 'Single & Bulk Scheduler', description: 'Schedule caption + gambar + timezone' },
      { name: 'Media Pipeline', description: 'Attach up to 4 images per post' },
      { name: 'Auto-publish Engine', description: 'Cron + Bull queue + Playwright browser automation' },
      { name: 'Live/Dry-run Toggle', description: 'Default OFF — aman untuk testing tanpa publish nyata' },
    ],
  },
  {
    category: 'Monitoring & Reliability',
    icon: 'activity',
    features: [
      { name: 'Dashboard Stats', description: 'Scheduled, published, failed, timeline, queue status' },
      { name: 'Retry 3x + Manual', description: 'Auto-retry failed posts + manual retry button' },
      { name: 'Publish History', description: 'Full history dengan CSV export' },
      { name: 'In-app Notifications', description: 'Alert saat publish gagal atau queue penuh' },
    ],
  },
];

async function main() {
  console.log('Seeding Threads Automation product...');

  const product = await upsertProduct({
    name: 'Threads Automation',
    slug: 'threads-automation',
    category: 'Social Media',
    displayOrder: 6,
    description:
      'Buat caption dengan AI, jadwalkan, dan auto-publish ke Meta Threads — supaya content creator tidak harus online di jam tayang. v3.0 AI Content + v2.0 live publish.',
    data: {
      tagline: 'AI Caption. Schedule. Auto-Publish.',
      longFormContent: [
        '## Content Automation untuk Meta Threads',
        '',
        'Threads Automation menyelesaikan tiga masalah: **buntu ide caption** (AI generate), **posting manual berulang** (scheduler), dan **takut gagal diam-diam** (retry + notifikasi + history).',
        '',
        '**v3.0** — AI caption single/batch, brand voice, best-time suggestion, cost tracking.',
        '**v2.0** — Live publish, media attach, bulk CSV, dry-run toggle.',
        '',
        'Prod internal: `https://ai.dntech.id`',
      ].join('\n'),
      status: 'active',
      featured: false,
      launchStatus: 'launched',
      freemiumEnabled: false,
      pricingTiers: PRICING_TIERS,
      features: FEATURES,
      useCases: [
        {
          id: 'creator',
          segment: 'Content Creator',
          icon: 'user',
          description: 'Generate caption AI, schedule mingguan, auto-publish tanpa harus online.',
          uniqueFeatures: ['AI caption', 'Bulk CSV', 'Best-time suggestion'],
          cta: { label: 'Join Waitlist', url: '/contact?product=threads-automation' },
        },
        {
          id: 'agency',
          segment: 'Social Media Agency',
          icon: 'users',
          description: 'Kelola multiple akun klien dari satu dashboard dengan brand voice per akun.',
          uniqueFeatures: ['Multi-account', 'Brand voice', 'Publish history export'],
          cta: { label: 'Hubungi Sales', url: '/contact?product=threads-automation' },
        },
      ],
      primaryCta: { label: 'Join Waitlist', url: '/contact?product=threads-automation', type: 'contact', color: 'blue', size: 'lg' },
      secondaryCtas: [{ label: 'Lihat Fitur', url: '#features', type: 'link' }],
      seoTitle: 'Threads Automation — AI Caption & Auto-Publish untuk Meta Threads',
      seoDescription: 'Generate caption AI, schedule posting, auto-publish ke Threads. Retry otomatis, publish history, dry-run mode. Internal: ai.dntech.id',
      keywords: 'threads automation, auto post threads, AI caption generator, social media scheduler Indonesia',
      faq: [
        {
          question: 'Apakah aman untuk testing?',
          answer: 'Ya. Default dry-run ON dan live toggle OFF — tidak akan publish nyata tanpa konfigurasi eksplisit.',
        },
        {
          question: 'Apakah official Meta tool?',
          answer: 'Tidak. Ini tool internal DN Tech yang memakai kredensial Threads user (disimpan terenkripsi). Bukan official Meta Ads tool.',
        },
      ],
      roadmap: [
        { quarter: 'Q2 2026', status: 'launched', features: [{ name: 'v2.0 Live Publish', description: 'Media attach, bulk CSV, retry engine' }] },
        { quarter: 'Q3 2026', status: 'launched', features: [{ name: 'v3.0 AI Content', description: 'AI caption, brand voice, cost tracking' }] },
        { quarter: 'Q4 2026', status: 'planned', features: [{ name: 'SaaS Launch', description: 'Multi-account SaaS tier untuk agency' }] },
      ],
    },
  });

  console.log(`Threads Automation product seeded: ${product.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
