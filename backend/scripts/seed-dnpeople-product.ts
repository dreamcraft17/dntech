/**
 * Seed the dnPeople flagship product page — pricing tiers, features, integrations,
 * use cases, testimonials, comparison table, roadmap, and CTAs.
 * Run from backend/: npx tsx scripts/seed-dnpeople-product.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRICING_TIERS = [
  {
    id: 'free', name: 'Gratis', icon: 'gift', tagline: 'Forever free untuk startup',
    popular: false, featured: false,
    pricing: { amount: 0, currency: 'IDR', billingPeriod: 'forever', description: 'Sampai 100 karyawan' },
    features: [
      'Employee database unlimited',
      'Org chart & reporting',
      'Attendance & leave management',
      'Employee portal',
      'Mobile browser-friendly',
    ],
    cta: { label: 'Mulai Gratis', url: 'https://app.dnpeople.id/signup', type: 'trial' },
  },
  {
    id: 'starter', name: 'Starter', icon: 'rocket', tagline: 'Untuk 1-50 karyawan',
    popular: false, featured: false,
    pricing: { amount: 20000, currency: 'IDR', billingPeriod: 'per employee per month', description: '30 karyawan = IDR 600K/bulan = IDR 7.2M/tahun' },
    features: [
      'Payroll otomatis',
      'Attendance & leave',
      'Email support',
      'Basic reporting',
      'Webhooks',
    ],
    cta: { label: 'Coba Sekarang', url: 'https://app.dnpeople.id/signup', type: 'trial' },
  },
  {
    id: 'professional', name: 'Professional', icon: 'star', tagline: 'Recommended untuk 50-300 karyawan',
    popular: true, featured: true,
    pricing: { amount: 25000, currency: 'IDR', billingPeriod: 'per employee per month', description: '150 karyawan = IDR 3.75M/bulan = IDR 45M/tahun' },
    features: [
      'Everything di Starter +',
      'Talent development (IDP, competency framework)',
      'Advanced leave management',
      'Overtime & claims',
      'Chat support (8 jam response)',
      'Basic customization',
      'Webhooks + 100 API calls/day',
      'Hemat IDR 225M/tahun vs Talenta',
    ],
    cta: { label: 'Pilih Professional', url: 'https://app.dnpeople.id/signup?plan=pro', type: 'trial' },
  },
  {
    id: 'business', name: 'Business', icon: 'building', tagline: 'Untuk 300+ karyawan',
    popular: false, featured: false,
    pricing: { amount: 20000, currency: 'IDR', billingPeriod: 'per employee per month', description: '500 karyawan = IDR 10M/bulan = IDR 120M/tahun' },
    features: [
      'Everything di Professional +',
      'Multi-branch support',
      'Custom workflows (up to 3 approval levels)',
      'REST API unlimited',
      'Priority support (4 jam response)',
      'Phone support',
      'Quarterly business reviews',
      'Hemat IDR 600M/tahun vs Talenta',
    ],
    cta: { label: 'Hubungi Sales', url: 'https://calendly.com/dntech/demo', type: 'demo' },
  },
  {
    id: 'enterprise', name: 'Enterprise', icon: 'crown', tagline: 'Untuk 500+ karyawan atau kebutuhan custom',
    popular: false, featured: false,
    pricing: { amount: null, currency: 'IDR', billingPeriod: 'custom', description: 'Custom pricing (usually IDR 15-18K/emp with volume)' },
    features: [
      'Everything di Business +',
      'Dedicated account manager',
      'Custom implementation',
      'White-label option',
      'SLA 99.5% uptime',
      'Priority development roadmap',
    ],
    cta: { label: 'Konsultasi Gratis', url: 'https://calendly.com/dntech/enterprise', type: 'demo' },
  },
];

const FEATURES = [
  {
    category: 'Core Payroll', icon: 'credit-card',
    features: [
      { name: 'Payroll Otomatis', description: 'Kalkulasi otomatis dari attendance + overtime' },
      { name: 'BPJS & PPh 21', description: 'Compliance penuh dengan regulasi Indonesia' },
      { name: 'Multi-component Salary', description: 'Unlimited tunjangan, bonus, potongan' },
      { name: 'Bayar Banyak Rekening', description: 'Gaji ke berbagai bank sekaligus' },
      { name: 'Payslip Digital', description: 'Otomatis dikirim ke karyawan' },
    ],
  },
  {
    category: 'Talent Development', icon: 'trending-up',
    features: [
      { name: 'IDP (Individual Development Plan)', description: 'Career roadmap per karyawan' },
      { name: 'Competency Framework', description: 'Define skill framework untuk org Anda' },
      { name: '9-Box Matrix', description: 'Identifikasi high performer & high potential' },
      { name: 'Succession Planning', description: 'Plan siapa pengganti critical roles' },
      { name: 'LMS (Learning Management)', description: 'Training + skill tracking untuk employees' },
    ],
  },
  {
    category: 'Attendance & Leave', icon: 'calendar',
    features: [
      { name: 'Geolocation Check-in', description: 'Absen dari mana saja, bukan hanya kantor' },
      { name: 'Overtime Tracking', description: 'Otomatis deteksi dan calculate lembur' },
      { name: 'Leave Balance Real-time', description: 'Karyawan bisa cek saldo cuti sendiri' },
      { name: 'Multiple Leave Types', description: 'Cuti tahunan, sakit, izin, dll' },
      { name: 'Carry-forward & Expired', description: 'Tracking automatic untuk sisa cuti' },
    ],
  },
  {
    category: 'Customization & Advanced', icon: 'sliders',
    features: [
      { name: 'Custom Approval Workflows', description: 'Multi-level approval dengan conditional routing' },
      { name: 'Differential UMR', description: 'Different minimum wage per kota' },
      { name: 'Multi-branch Management', description: 'Handle multiple kantor dalam satu dashboard' },
      { name: 'Custom Fields & Reporting', description: 'Flexible reporting sesuai kebutuhan' },
    ],
  },
  {
    category: 'Developer & Integration', icon: 'code',
    features: [
      { name: 'REST API', description: 'Open API untuk integrasi dengan sistem lain' },
      { name: 'Webhooks', description: 'Real-time event notifications' },
      { name: 'Pre-built Integrations', description: 'Connect dengan Jurnal, Xendit, major banks' },
      { name: 'Complete Documentation', description: 'API docs, SDKs, code samples' },
    ],
  },
];

const INTEGRATIONS = [
  { name: 'Jurnal', logo: 'https://cdn.dntech.id/integrations/jurnal.png', category: 'Accounting', description: 'Sync payroll ke Jurnal untuk accurate financial reporting', status: 'available', url: 'https://dnpeople.id/integrations/jurnal' },
  { name: 'Xendit', logo: 'https://cdn.dntech.id/integrations/xendit.png', category: 'Payments', description: 'Proses pembayaran gaji via Xendit API', status: 'available', url: 'https://dnpeople.id/integrations/xendit' },
  { name: 'BCA API', logo: 'https://cdn.dntech.id/integrations/bca.png', category: 'Banking', description: 'Direct bank transfer ke rekening karyawan', status: 'available', url: 'https://dnpeople.id/integrations/bca' },
  { name: 'Mandiri API', logo: 'https://cdn.dntech.id/integrations/mandiri.png', category: 'Banking', description: 'Direct bank transfer via Mandiri', status: 'available', url: 'https://dnpeople.id/integrations/mandiri' },
  { name: 'Slack', logo: 'https://cdn.dntech.id/integrations/slack.png', category: 'Communication', description: 'Get payroll alerts & notifications di Slack', status: 'coming_soon', url: 'https://dnpeople.id/integrations/slack' },
  { name: 'Google Workspace', logo: 'https://cdn.dntech.id/integrations/google.png', category: 'Authentication', description: 'SSO with Google Workspace', status: 'available', url: 'https://dnpeople.id/integrations/google' },
];

const USE_CASES = [
  {
    id: 'manufacturing', segment: 'Manufaktur & Pabrik', icon: 'factory',
    description: 'HR solution untuk pabrik dengan shift kompleks & multi-branch',
    uniqueFeatures: ['Shift scheduling (rotation, swap)', 'Night shift premium calculation', 'Production incentives', 'Safety incident tracking'],
    testimonial: { quote: 'Hemat IDR 200 juta per tahun dari Talenta. Setup multi-branch dengan UMR berbeda jadi simple.', author: 'HR Director', company: 'Manufaktur 500 orang', location: 'Jakarta' },
    stats: { savings: 'IDR 200M/tahun', timeToPayroll: '10 menit', setupTime: '1 hari' },
    cta: { label: 'Lihat Demo untuk Manufaktur', url: 'https://calendly.com/dntech/demo-manufacturing' },
  },
  {
    id: 'retail', segment: 'Retail & F&B', icon: 'shopping-bag',
    description: 'HR platform untuk retail & food & beverage dengan crew scheduling & tip pooling',
    uniqueFeatures: ['Crew scheduling dashboard', 'Tip pooling & distribution', 'High-volume bulk hiring', 'Quick onboarding/offboarding', 'Shift flexibility'],
    testimonial: { quote: 'Crew scheduling jadi automated. Tidak lagi conflict antar shift. Crew happy, we happy.', author: 'People Manager', company: 'Retail Chain 300 orang', location: 'Surabaya' },
    stats: { savings: 'IDR 90M/tahun', timeToPayroll: '10 menit', setupTime: '3 hari' },
    cta: { label: 'Lihat Demo untuk Retail', url: 'https://calendly.com/dntech/demo-retail' },
  },
  {
    id: 'startup', segment: 'Startup & Tech', icon: 'rocket',
    description: 'Modern HRIS untuk startup: free tier generous, API-first, mobile-friendly',
    uniqueFeatures: ['Free tier untuk 100 employees', 'API-first architecture', 'Webhooks & integrations', 'Mobile browser-responsive', 'Flexible payment (month-to-month)'],
    testimonial: { quote: 'Coba free tier dulu, terus upgrade ke Professional. Harganya terjangkau, fiturnya lengkap.', author: 'CEO', company: 'Tech Startup 50 orang', location: 'Bandung' },
    stats: { savings: 'IDR 25M/tahun (vs Talenta)', timeToPayroll: '10 menit', setupTime: '30 menit' },
    cta: { label: 'Mulai Gratis Sekarang', url: 'https://app.dnpeople.id/signup' },
  },
];

const TESTIMONIALS = [
  {
    id: 'testimonial-1',
    quote: 'Hemat IDR 200 juta per tahun dari Talenta. Talent development yang included sangat membantu untuk succession planning kami.',
    author: 'HR Director', company: 'Perusahaan Manufaktur', employeeCount: '500 karyawan', location: 'Jakarta', industry: 'Manufacturing',
    avatar: 'https://cdn.dntech.id/testimonials/avatar-1.jpg', rating: 5, videoUrl: null, segment: 'manufacturing',
  },
  {
    id: 'testimonial-2',
    quote: 'Setup payroll yang complicated dengan multiple branches jadi simple. Support team mereka sangat responsif.',
    author: 'People Manager', company: 'Retail Chain', employeeCount: '300 karyawan', location: 'Surabaya', industry: 'Retail',
    avatar: 'https://cdn.dntech.id/testimonials/avatar-2.jpg', rating: 5, videoUrl: null, segment: 'retail',
  },
  {
    id: 'testimonial-3',
    quote: 'Coba free tier dulu, terus upgrade ke Professional. Harganya terjangkau, fiturnya lengkap. Tidak perlu cari system lain.',
    author: 'CEO', company: 'Tech Startup', employeeCount: '50 karyawan', location: 'Bandung', industry: 'Technology',
    avatar: 'https://cdn.dnpeople.id/testimonials/avatar-3.jpg', rating: 5, videoUrl: null, segment: 'startup',
  },
];

const COMPARISON_TABLE = {
  title: 'dnPeople vs Kompetitor',
  competitors: ['dnPeople', 'Talenta', 'Gadjian', 'Gajihub'],
  rows: [
    { feature: 'Harga per Employee', dnpeople: 'IDR 20-25K', talenta: 'IDR 100-150K', gadjian: 'IDR 12-20K', gajihub: 'IDR 11.9K', category: 'pricing' },
    { feature: 'Payroll', dnpeople: '✅', talenta: '✅', gadjian: '✅', gajihub: '✅', category: 'core' },
    { feature: 'Talent Development', dnpeople: '✅ Included', talenta: '❌ +IDR 200K', gadjian: '⚠️ Limited', gajihub: '❌', category: 'features' },
    { feature: 'API', dnpeople: '✅ Included', talenta: '❌ No', gadjian: '⚠️ Limited', gajihub: '❌', category: 'features' },
    { feature: 'Customization', dnpeople: '✅ Advanced', talenta: '⚠️ Basic', gadjian: '⚠️ Basic', gajihub: '⚠️ Limited', category: 'features' },
    { feature: 'Mobile App', dnpeople: '🚧 Q3 2027', talenta: '✅', gadjian: '⚠️ Web only', gajihub: '✅', category: 'features' },
    { feature: 'Transparent Pricing', dnpeople: '✅', talenta: '❌ Contact sales', gadjian: '✅', gajihub: '✅', category: 'pricing' },
  ],
};

const ROADMAP = [
  { quarter: 'Q3 2026', status: 'launched', features: [
    { name: 'Core Payroll & Talent Development', description: 'Payroll otomatis, IDP, 9-box matrix, succession planning' },
    { name: 'API v1', description: 'REST API untuk integrasi' },
  ] },
  { quarter: 'Q4 2026', status: 'in_progress', features: [
    { name: 'LMS (Learning Management System)', description: 'Training program tracking & management' },
    { name: 'Advanced Reporting', description: 'Custom dashboards & report builder' },
    { name: 'Bank Integrations', description: 'BCA, Mandiri, BRI untuk auto-transfer gaji' },
  ] },
  { quarter: 'Q1 2027', status: 'planned', features: [
    { name: 'Employee Self-Service Portal Upgrade', description: 'Better UX untuk employee profile management' },
    { name: 'Performance Management Module', description: 'Annual review, goal tracking, 360 feedback' },
  ] },
  { quarter: 'Q3 2027', status: 'planned', features: [
    { name: 'Native Mobile App', description: 'iOS & Android app untuk attendance & leave' },
  ] },
];

const PRIMARY_CTA = { label: 'Mulai Gratis Sekarang', url: 'https://app.dnpeople.id/signup', type: 'trial', color: 'blue', size: 'lg' };

const SECONDARY_CTAS = [
  { label: 'Lihat Pricing', url: '#pricing', type: 'link' },
  { label: 'Schedule Demo (15 min)', url: 'https://calendly.com/dntech/demo', type: 'demo' },
  { label: 'Lihat Dokumentasi', url: 'https://docs.dnpeople.id', type: 'documentation' },
];

async function main() {
  console.log('Seeding dnPeople product...');

  const product = await prisma.product.upsert({
    where: { slug: 'dnpeople' },
    create: {
      name: 'dnPeople',
      slug: 'dnpeople',
      category: 'HRIS',
      tagline: 'Payroll & HR jadi mudah. Harga terjangkau.',
      description: 'dnPeople adalah solusi HRIS untuk SME Indonesia — payroll otomatis, talent development, dan attendance management dalam satu platform dengan harga transparan.',
      status: 'active',
      featured: true,
      launchStatus: 'launched',
      freemiumEnabled: true,
      freeLimit: '100 employees',
      trialDays: 30,
      customerCount: '500+',
      pricingTiers: PRICING_TIERS,
      features: FEATURES,
      integrations: INTEGRATIONS,
      useCases: USE_CASES,
      testimonials: TESTIMONIALS,
      comparisonTable: COMPARISON_TABLE,
      roadmap: ROADMAP,
      primaryCta: PRIMARY_CTA,
      secondaryCtas: SECONDARY_CTAS,
      demoUrl: 'https://calendly.com/dntech/demo',
      seoTitle: 'dnPeople — HRIS Indonesia untuk SME',
      seoDescription: 'Payroll otomatis, talent development, dan attendance management dalam satu platform dengan harga transparan.',
    },
    update: {
      tagline: 'Payroll & HR jadi mudah. Harga terjangkau.',
      description: 'dnPeople adalah solusi HRIS untuk SME Indonesia — payroll otomatis, talent development, dan attendance management dalam satu platform dengan harga transparan.',
      featured: true,
      launchStatus: 'launched',
      freemiumEnabled: true,
      freeLimit: '100 employees',
      trialDays: 30,
      customerCount: '500+',
      pricingTiers: PRICING_TIERS,
      features: FEATURES,
      integrations: INTEGRATIONS,
      useCases: USE_CASES,
      testimonials: TESTIMONIALS,
      comparisonTable: COMPARISON_TABLE,
      roadmap: ROADMAP,
      primaryCta: PRIMARY_CTA,
      secondaryCtas: SECONDARY_CTAS,
      demoUrl: 'https://calendly.com/dntech/demo',
    },
  });

  console.log(`dnPeople product seeded: ${product.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
