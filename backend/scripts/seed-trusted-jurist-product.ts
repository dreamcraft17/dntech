/**
 * Seed Trusted Jurist (TJ) showcase product page.
 * Source: company-wiki/docs/products/tj/
 * Run: npx tsx scripts/seed-trusted-jurist-product.ts
 */
import { prisma, upsertProduct } from './product-seed-shared';

const FEATURES = [
  {
    category: 'Website & Content',
    icon: 'globe',
    features: [
      { name: '7 Halaman Publik', description: 'Home, about, team, practice areas, contact, careers, privacy' },
      { name: 'Editorial Design System', description: 'Mahogany/brass/parchment tokens, UI kit, layout sections' },
      { name: 'Practice Areas', description: 'Showcase bidang hukum dengan detail per area' },
      { name: 'Team Profiles', description: 'Profil advokat dengan foto dan bio' },
    ],
  },
  {
    category: 'Lead Generation',
    icon: 'mail',
    features: [
      { name: 'Contact Form', description: 'Form kontak dengan validasi + email via Resend' },
      { name: 'Careers Application', description: 'Lowongan kerja + form lamaran' },
      { name: 'SEO Assets', description: 'Meta tags, sitemap, structured data' },
    ],
  },
  {
    category: 'Technical',
    icon: 'code',
    features: [
      { name: 'Next.js 16 + React 19', description: 'App Router, SSR, Tailwind v4' },
      { name: 'Framer Motion', description: 'Animasi editorial halus' },
      { name: 'reCAPTCHA', description: 'Spam protection pada form' },
    ],
  },
];

async function main() {
  console.log('Seeding Trusted Jurist product...');

  const product = await upsertProduct({
    name: 'Trusted Jurist',
    slug: 'trusted-jurist',
    category: 'Client Solutions',
    displayOrder: 7,
    description:
      'Website company profile firma hukum Trusted Jurist (Jakarta Timur) — 7 halaman, design system editorial, form kontak Resend, SEO-ready. Contoh deliverable DN Tech untuk klien professional services.',
    data: {
      tagline: 'Law Firm Company Profile. Editorial Design.',
      longFormContent: [
        '## Showcase: Professional Services Website',
        '',
        'Trusted Jurist adalah contoh deliverable DN Tech untuk klien firma hukum — design system editorial (mahogany/brass/parchment), 7 halaman publik, form kontak dengan Resend, dan SEO foundation.',
        '',
        'Live: [trustedjurist.co.id](https://trustedjurist.co.id)',
      ].join('\n'),
      status: 'active',
      featured: false,
      launchStatus: 'launched',
      customerCount: '1 client',
      pricingTiers: [
        {
          id: 'custom',
          name: 'Custom Project',
          icon: 'briefcase',
          tagline: 'Company profile website',
          popular: true,
          featured: true,
          pricing: { amount: null, currency: 'IDR', billingPeriod: 'project', description: 'Scope-based · mulai Rp 25 juta' },
          features: ['Design system custom', 'CMS-ready architecture', 'Contact form + email', 'SEO foundation', 'Mobile responsive', '30 hari support pasca-launch'],
          cta: { label: 'Konsultasi Project Serupa', url: '/contact?product=trusted-jurist', type: 'contact' },
        },
      ],
      features: FEATURES,
      primaryCta: { label: 'Lihat Live Site', url: 'https://trustedjurist.co.id', type: 'link', color: 'blue', size: 'lg' },
      secondaryCtas: [
        { label: 'Minta Project Serupa', url: '/contact?intent=company-profile', type: 'contact' },
      ],
      seoTitle: 'Trusted Jurist — Law Firm Website by DN Tech',
      seoDescription: 'Showcase website company profile firma hukum. Design editorial, 7 halaman, form kontak, SEO-ready. Live: trustedjurist.co.id',
      keywords: 'website firma hukum, company profile law firm, jasa website profesional, Trusted Jurist',
      faq: [
        {
          question: 'Apakah ini produk SaaS DN Tech?',
          answer: 'Tidak. Trusted Jurist adalah client project — contoh deliverable custom website DN Tech untuk professional services.',
        },
        {
          question: 'Bisa buat website serupa untuk bisnis saya?',
          answer: 'Ya. DN Tech build custom company profile websites mulai Rp 25 juta. Hubungi kami via form kontak.',
        },
      ],
    },
  });

  console.log(`Trusted Jurist product seeded: ${product.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
