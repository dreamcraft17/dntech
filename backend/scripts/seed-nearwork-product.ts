/**
 * Seed Nearwork product page.
 * Source: company-wiki/docs/products/nearwork/
 * Run: npx tsx scripts/seed-nearwork-product.ts
 */
import { prisma, upsertProduct } from './product-seed-shared';

const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    icon: 'gift',
    tagline: 'Mulai rekrut freelancer',
    popular: false,
    featured: false,
    pricing: { amount: 0, currency: 'IDR', billingPeriod: 'forever', description: '5 bid aktif · 2 kontrak aktif' },
    features: ['Post job unlimited', '5 active bids', '2 active contracts', 'Public profile', 'Basic messaging'],
    cta: { label: 'Daftar Gratis', url: '/contact?product=nearwork', type: 'trial' },
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: 'star',
    tagline: 'Freelancer & klien aktif',
    popular: true,
    featured: true,
    pricing: { amount: 99000, currency: 'IDR', billingPeriod: 'per bulan', description: '30 bid · 10 kontrak · analytics advanced' },
    features: [
      '30 active bids',
      '10 active contracts',
      'Advanced analytics',
      'Boost & premium badge',
      'Priority in search',
      'Email support',
    ],
    cta: { label: 'Upgrade ke Pro', url: '/contact?product=nearwork&plan=pro', type: 'trial' },
  },
  {
    id: 'agency',
    name: 'Agency',
    icon: 'building',
    tagline: 'Tim & multi-seat',
    popular: false,
    featured: false,
    pricing: { amount: null, currency: 'IDR', billingPeriod: 'custom', description: 'Higher quotas · shared billing · team workflow' },
    features: [
      'Everything di Pro +',
      'Multi-seat operations',
      'Shared billing',
      'Team workflow',
      'Dedicated support',
      'Custom branding',
    ],
    cta: { label: 'Hubungi Sales', url: 'https://calendly.com/dntech/demo', type: 'demo' },
  },
];

const FEATURES = [
  {
    category: 'Marketplace Hiring',
    icon: 'users',
    features: [
      { name: 'Job Posting', description: 'Klien post lowongan remote, on-site, atau hybrid dengan filter kota & kategori' },
      { name: 'Proposal & Bidding', description: 'Freelancer kirim proposal terikat pada job — bukan chat random' },
      { name: 'Contract Management', description: 'Alur penerimaan → kontrak → komunikasi terstruktur' },
      { name: 'Public Discovery', description: 'Browse job & profil freelancer tanpa login; login wajib untuk aksi' },
    ],
  },
  {
    category: 'Discovery & Matching',
    icon: 'map-pin',
    features: [
      { name: 'Geo Matching', description: 'Filter berdasarkan kota dan mode kerja (remote/on-site/hybrid)' },
      { name: 'Category Taxonomy', description: 'Digital, kreatif, profesional, hyperlocal services' },
      { name: 'Search & Filters', description: 'Temukan freelancer atau job yang cocok dengan cepat' },
    ],
  },
  {
    category: 'Platform & Billing',
    icon: 'credit-card',
    features: [
      { name: 'Quota & Entitlements', description: 'Architecture siap monetization dengan transparansi quota' },
      { name: 'Bilingual UI', description: 'Bahasa Indonesia & English — preferensi tersimpan' },
      { name: 'Admin Workspace', description: 'Staff moderasi, verifikasi, dan operasional via /admin' },
    ],
  },
];

async function main() {
  console.log('Seeding Nearwork product...');

  const product = await upsertProduct({
    name: 'Nearwork',
    slug: 'nearwork',
    category: 'Marketplace',
    displayOrder: 4,
    description:
      'Marketplace freelance untuk merekrut — klien post job, freelancer kirim proposal, dan percakapan tetap terikat pada lowongan. Remote maupun on-site, untuk berbagai jenis pekerjaan.',
    data: {
      tagline: 'Rekrut Freelancer. Remote & On-site.',
      longFormContent: [
        '## Marketplace Hiring yang Terstruktur',
        '',
        'Nearwork bukan sekadar direktori freelancer. Ada **siklus pekerjaan lengkap**: job → bid → penerimaan → kontrak, dengan aturan quota, plan, dan discovery publik.',
        '',
        'Cocok untuk digital (desain, konten), kreatif (foto, video), profesional (konsultasi), dan jasa hyperlocal (event, perbaikan).',
      ].join('\n'),
      status: 'active',
      featured: false,
      launchStatus: 'beta',
      freemiumEnabled: true,
      freeLimit: '5 bid aktif',
      trialDays: 0,
      pricingTiers: PRICING_TIERS,
      features: FEATURES,
      useCases: [
        {
          id: 'client',
          segment: 'Klien / Bisnis',
          icon: 'briefcase',
          description: 'Post job, bandingkan proposal, pilih freelancer, kelola kontrak.',
          uniqueFeatures: ['Structured hiring flow', 'Quota-based bidding', 'Contract tracking'],
          cta: { label: 'Post Job', url: '/contact?product=nearwork' },
        },
        {
          id: 'freelancer',
          segment: 'Freelancer',
          icon: 'user',
          description: 'Bangun profil publik, cari job, kirim proposal, kerja via platform.',
          uniqueFeatures: ['Public profile', 'Geo-filtered jobs', 'Premium badge (Pro)'],
          cta: { label: 'Buat Profil', url: '/contact?product=nearwork' },
        },
      ],
      primaryCta: { label: 'Join Waitlist', url: '/contact?product=nearwork', type: 'contact', color: 'blue', size: 'lg' },
      secondaryCtas: [{ label: 'Lihat Pricing', url: '#pricing', type: 'link' }],
      demoUrl: 'https://calendly.com/dntech/demo',
      seoTitle: 'Nearwork — Marketplace Freelance Remote & On-site',
      seoDescription: 'Platform hiring freelancer terstruktur. Job posting, proposal, kontrak — remote maupun on-site. Early access tersedia.',
      keywords: 'marketplace freelance Indonesia, rekrut freelancer, platform hiring, Nearwork',
      faq: [
        {
          question: 'Apa bedanya dengan platform freelance lain?',
          answer: 'Nearwork fokus pada hiring terstruktur (job-bound proposals) dengan geo matching dan quota architecture — bukan sekadar chat atau direktori.',
        },
        {
          question: 'Sudah bisa dipakai publik?',
          answer: 'Sedang in development dengan early-access UX. Join waitlist untuk akses beta.',
        },
      ],
      roadmap: [
        { quarter: 'Q3 2026', status: 'in_progress', features: [{ name: 'Beta Access', description: 'Client & freelancer onboarding' }] },
        { quarter: 'Q4 2026', status: 'planned', features: [{ name: 'Monetization Launch', description: 'Pro & Agency tiers live' }] },
      ],
    },
  });

  console.log(`Nearwork product seeded: ${product.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
