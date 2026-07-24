/**
 * Seed the dnPeople flagship product page — pricing tiers, features, integrations,
 * use cases, testimonials, comparison table, roadmap, FAQ, and CTAs.
 * Source copy: company-wiki/docs/products/dnPeople/copywriting/dnpeople-website-copywriting-id_2.md.
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
      'Employee portal (karyawan lihat own data)',
      'Mobile browser-friendly',
    ],
    cta: { label: 'Mulai Gratis', url: 'https://hris.dntech.id/', type: 'trial' },
  },
  {
    id: 'starter', name: 'Starter', icon: 'rocket', tagline: 'Untuk 1-50 karyawan',
    popular: false, featured: false,
    pricing: { amount: 20000, currency: 'IDR', billingPeriod: 'per karyawan per bulan', description: '30 karyawan = IDR 600K/bulan = IDR 7.2M/tahun (Vendor enterprise: IDR 4.5M/bulan = IDR 54M/tahun)' },
    features: [
      'Payroll otomatis',
      'Attendance & leave',
      'Email support',
      'Basic reporting',
      'Webhooks',
    ],
    cta: { label: 'Coba Sekarang', url: 'https://hris.dntech.id/', type: 'trial' },
  },
  {
    id: 'professional', name: 'Professional', icon: 'star', tagline: 'Recommended untuk 50-300 karyawan',
    popular: true, featured: true,
    pricing: { amount: 25000, currency: 'IDR', billingPeriod: 'per karyawan per bulan', description: '150 karyawan = IDR 3.75M/bulan = IDR 45M/tahun. Hemat IDR 225M/tahun dibanding Vendor enterprise' },
    features: [
      'Everything di Starter +',
      'Talent development (IDP, competency framework)',
      'Advanced leave management',
      'Overtime & claims',
      'Chat support (8 jam response)',
      'Basic customization',
      'Webhooks + 100 API calls/day',
    ],
    cta: { label: 'Pilih Professional', url: 'https://hris.dntech.id/?plan=pro', type: 'trial' },
  },
  {
    id: 'business', name: 'Business', icon: 'building', tagline: 'Untuk 300+ karyawan (volume discount)',
    popular: false, featured: false,
    pricing: { amount: 20000, currency: 'IDR', billingPeriod: 'per karyawan per bulan', description: '500 karyawan = IDR 10M/bulan = IDR 120M/tahun. Hemat IDR 600M/tahun dibanding Vendor enterprise' },
    features: [
      'Everything di Professional +',
      'Multi-branch support',
      'Custom workflows (up to 3 approval levels)',
      'REST API unlimited',
      'Priority support (4 jam response)',
      'Phone support',
      'Quarterly business reviews',
    ],
    cta: { label: 'Hubungi Sales', url: 'https://calendly.com/dntech/demo', type: 'demo' },
  },
  {
    id: 'enterprise', name: 'Enterprise', icon: 'crown', tagline: 'Untuk 500+ karyawan atau kebutuhan custom',
    popular: false, featured: false,
    pricing: { amount: null, currency: 'IDR', billingPeriod: 'custom', description: 'Custom pricing (biasanya IDR 15-18K/emp dengan volume)' },
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
    category: 'Payroll Otomatis', icon: 'credit-card',
    features: [
      { name: 'Kalkulasi dari Attendance + Overtime', description: 'Payroll selesai dalam 10 menit, sekali setup tinggal approve setiap bulan' },
      { name: 'BPJS, PPh 21, THR', description: 'Semua calculation compliance dengan regulasi Indonesia' },
      { name: 'Multi-component Salary', description: 'Unlimited tunjangan, bonus, potongan' },
      { name: 'Bayar Banyak Rekening', description: 'Gaji ke berbagai bank sekaligus' },
      { name: 'Payslip Digital', description: 'Otomatis dikirim ke karyawan' },
    ],
  },
  {
    category: 'Attendance & Leave Management', icon: 'calendar',
    features: [
      { name: 'Geolocation Check-in', description: 'Absen via aplikasi mobile-responsive atau web, dari mana saja' },
      { name: 'Approval Real-time', description: 'Manager approve real-time, HR lihat semua dalam satu dashboard' },
      { name: 'Overtime Tracking', description: 'Otomatis deteksi dan calculate lembur' },
      { name: 'Leave Balance Real-time', description: 'Karyawan bisa cek saldo cuti sendiri' },
      { name: 'Multiple Leave Types', description: 'Cuti tahunan, sakit, izin, dll' },
      { name: 'Carry-forward & Expired', description: 'Tracking otomatis untuk sisa cuti' },
    ],
  },
  {
    category: 'Talent Development & Career Path', icon: 'trending-up',
    features: [
      { name: 'Competency Framework', description: 'Define skill apa yang penting di perusahaan Anda' },
      { name: 'IDP (Individual Development Plan)', description: 'Setiap karyawan punya growth roadmap' },
      { name: '9-Box Matrix', description: 'Visualisasi siapa high performer, siapa high potential' },
      { name: 'Succession Planning', description: 'Siapa pengganti untuk critical roles?' },
      { name: 'LMS (Learning Management System)', description: 'Training + skill tracking. Vendor enterprise charge IDR 200K/bulan untuk fitur ini — dnPeople include di semua paket' },
    ],
  },
  {
    category: 'Customization & Multi-Branch', icon: 'sliders',
    features: [
      { name: 'Differential UMR per Kota', description: 'Jakarta vs Surabaya beda harga, otomatis disesuaikan' },
      { name: 'Custom Approval Workflows', description: 'Approval chain bisa beda per department atau lokasi' },
      { name: 'Multi-company/Multi-branch', description: 'Handle multiple kantor dalam satu dashboard' },
      { name: 'Location-specific Compliance', description: 'Rules engine flexible, bukan template pre-built' },
      { name: 'Custom Fields & Reporting', description: 'Flexible reporting sesuai kebutuhan' },
    ],
  },
  {
    category: 'API & Integrasi', icon: 'code',
    features: [
      { name: 'REST API', description: 'Open API untuk pull/push data, tidak ada "enterprise plan" yang membedakan akses' },
      { name: 'Webhooks', description: 'Real-time event notifications untuk sync sistem lain' },
      { name: 'Pre-built Integrations', description: 'Jurnal, Xendit, major banks, POS' },
      { name: 'Complete Documentation', description: 'API docs, SDKs, code samples — developer-friendly' },
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
    description: 'HR Management untuk pabrik dengan shift kompleks & multi-branch UMR. Harga 1/5 dari Vendor enterprise. Payroll jadi 10 menit.',
    uniqueFeatures: ['Shift scheduling (rotation, swap)', 'Night shift premium calculation', 'Production incentives', 'Safety incident tracking', 'Multi-branch differential UMR setup'],
    testimonial: { quote: 'Hemat IDR 200 juta per tahun dari Vendor enterprise. Setup multi-branch dengan UMR berbeda jadi simple.', author: 'HR Director', company: 'Manufaktur 500 orang', location: 'Jakarta' },
    stats: { savings: 'IDR 200M/tahun', timeToPayroll: '10 menit', setupTime: '1 hari' },
    cta: { label: 'Lihat Demo untuk Manufaktur', url: 'https://calendly.com/dntech/demo-manufacturing' },
  },
  {
    id: 'retail', segment: 'Retail & F&B', icon: 'shopping-bag',
    description: 'HRIS untuk retail & F&B — crew scheduling, tip pooling, high-volume hiring, semua otomatis. Hemat IDR 50M/bulan dari Vendor enterprise.',
    uniqueFeatures: ['Crew scheduling dashboard', 'Tip pooling & distribution', 'High-volume bulk hiring', 'Quick onboarding/offboarding', 'Shift flexibility'],
    testimonial: { quote: 'Crew scheduling jadi automated. Tidak lagi conflict antar shift. Crew happy, we happy.', author: 'People Manager', company: 'Retail Chain 300 orang', location: 'Surabaya' },
    stats: { savings: 'IDR 90M/tahun', timeToPayroll: '10 menit', setupTime: '3 hari' },
    cta: { label: 'Lihat Demo untuk Retail', url: 'https://calendly.com/dntech/demo-retail' },
  },
  {
    id: 'startup', segment: 'Startup & Tech', icon: 'rocket',
    description: 'HRIS untuk startup — gratis untuk 100 orang, bayar hanya saat scale. Modern, mobile-friendly, developer-friendly.',
    uniqueFeatures: ['Free tier generous (100 employees)', 'API-first architecture', 'Webhooks & integrations', 'Mobile browser-responsive', 'Flexible payment (month-to-month)'],
    testimonial: { quote: 'Coba free tier dulu, terus upgrade ke Professional. Harganya terjangkau, fiturnya lengkap.', author: 'CEO', company: 'Tech Startup 50 orang', location: 'Bandung' },
    stats: { savings: 'IDR 25M/tahun (vs Vendor enterprise)', timeToPayroll: '10 menit', setupTime: '30 menit' },
    cta: { label: 'Mulai Gratis Sekarang', url: 'https://hris.dntech.id/' },
  },
];

const TESTIMONIALS = [
  {
    id: 'testimonial-1',
    quote: 'Hemat IDR 200 juta per tahun dari Vendor enterprise. Talent development yang included sangat membantu untuk succession planning kami.',
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
  title: 'Perbandingan Fitur: dnPeople vs Industry Standard',
  conclusion: 'dnPeople adalah titik tengah yang tepat: 80% lebih terjangkau daripada Vendor enterprise, tetapi lebih powerful daripada Budget HRIS karena talent development, API, dan customization sudah termasuk. Harga transparan, tanpa biaya tersembunyi, dengan trial penuh selama 30 hari.',
  competitors: ['dnPeople', 'Enterprise Vendor', 'Budget HRIS'],
  rows: [
    { feature: 'Harga/Employee', dnpeople: 'IDR 20-25K', enterprisevendor: 'IDR 100-150K', budgethris: 'IDR 10-20K', category: 'pricing' },
    { feature: 'Payroll (BPJS, PPh 21)', dnpeople: '✅ Complete', enterprisevendor: '✅ Complete', budgethris: '✅ Basic', category: 'core' },
    { feature: 'Talent Development', dnpeople: '✅ Included (IDP, 9-box, succession)', enterprisevendor: '❌ Add-on +IDR 100-200K', budgethris: '⚠️ Limited/None', category: 'features' },
    { feature: 'API & Integrations', dnpeople: '✅ Included (REST, webhooks)', enterprisevendor: '❌ Extra cost or not available', budgethris: '⚠️ Limited', category: 'features' },
    { feature: 'Customization', dnpeople: '✅ Rule-based (flexible)', enterprisevendor: '⚠️ Template-based (rigid)', budgethris: '⚠️ Very limited', category: 'features' },
    { feature: 'Multi-branch Support', dnpeople: '✅ Advanced (different UMR per location)', enterprisevendor: '⚠️ Basic', budgethris: '⚠️ Limited', category: 'features' },
    { feature: 'Mobile App', dnpeople: '🚧 Q3 2027', enterprisevendor: '✅ Native app', budgethris: '✅ Web responsive', category: 'features' },
    { feature: 'Transparent Pricing', dnpeople: '✅ Fixed pricing on website', enterprisevendor: '❌ "Contact sales" mystery pricing', budgethris: '✅ Clear pricing', category: 'pricing' },
    { feature: 'Implementation Time', dnpeople: '2-4 minggu', enterprisevendor: '8-12 minggu', budgethris: '1-2 minggu', category: 'service' },
    { feature: 'Support Response', dnpeople: '24-hour guaranteed', enterprisevendor: 'Slow (enterprise SLA)', budgethris: 'Email only', category: 'service' },
    { feature: 'Free Trial', dnpeople: '✅ 30 hari (full access)', enterprisevendor: '⚠️ 14 hari (limited)', budgethris: '⚠️ Free tier terbatas', category: 'pricing' },
    { feature: 'No Hidden Fees', dnpeople: '✅ Transparan', enterprisevendor: '❌ Surprise add-ons', budgethris: '✅ Tapi fitur terbatas', category: 'pricing' },
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
    { name: 'Native Mobile App', description: 'iOS & Android app untuk attendance & leave. Existing customers keep current pricing untuk 12 bulan setelah launch' },
  ] },
];

const PRIMARY_CTA = { label: 'Coba Gratis Sekarang', url: 'https://hris.dntech.id/', type: 'trial', color: 'blue', size: 'lg' };

const SECONDARY_CTAS = [
  { label: 'Lihat Pricing', url: '#pricing', type: 'link' },
  { label: 'Lihat Demo (5 menit)', url: 'https://calendly.com/dntech/demo', type: 'demo' },
  { label: 'Baca Dokumentasi', url: 'https://docs.dnpeople.id', type: 'documentation' },
];

const FAQ = [
  {
    question: 'Apakah ada biaya tersembunyi?',
    answer: 'Tidak. Harga yang Anda lihat di website adalah harga sebenarnya. Tidak ada biaya setup, tidak ada "premium features" yang charge terpisah, tidak ada surprise saat billing. Hanya ada optional add-ons (misalnya white-label atau custom development), dan itu dijelaskan di awal.',
  },
  {
    question: 'Bisa trial dulu sebelum bayar?',
    answer: 'Ya! Dua cara: (1) Free tier — gratis selamanya untuk sampai 100 karyawan, full access ke semua fitur core (payroll, leave, attendance, talent dev). (2) Paid tier trial — 30 hari free di tier manapun, tanpa credit card, coba Professional tier dengan full features.',
  },
  {
    question: 'Bisakah migrate dari Vendor enterprise?',
    answer: 'Bisa! Kami punya dedicated migration service — export data dari Vendor enterprise, mapping ke dnPeople schema, training tim Anda, dan go-live support. Included di paket tahun pertama, tanpa biaya tambahan.',
  },
  {
    question: 'Support-nya bagus ga?',
    answer: 'Tergantung tier: Free/Starter — email support (24 jam response). Professional — chat support (8 jam response). Business — priority support (4 jam response) + phone. Enterprise — dedicated account manager + 24/7 phone. Plus ada knowledge base lengkap, video tutorial, dan community forum.',
  },
  {
    question: 'Kapan ada mobile app native?',
    answer: 'Roadmap: Q3 2027. Sampai saat itu, dnPeople fully responsive di mobile browser — cukup untuk attendance check-in, leave request, lihat payslip, dan employee info. Saat mobile app launch, existing customers keep harga saat ini untuk 12 bulan berikutnya.',
  },
  {
    question: 'Apakah cocok untuk perusahaan besar (1000+ karyawan)?',
    answer: 'Cocok, bahkan lebih cocok — scalable architecture, multi-company support (holding + subsidiary satu platform), advanced customization (rule engine, conditional workflows), dan volume discount (IDR 15-18K per employee untuk 1000+). Pricing 1/8 dari SAP SuccessFactors atau Workday dengan fitur 80% sama.',
  },
  {
    question: 'Apakah support BPJS dan PPh 21?',
    answer: 'Ya, fully support. BPJS Kesehatan + Ketenagakerjaan auto-calculation, PPh 21 dengan form 1721 A1/A2 untuk lapor ke DJP, THR calculation + payment tracking, tunjangan/potongan custom unlimited, dan gross/net/gross-up tax method. Update regulasi 1-2 minggu setelah DJP update.',
  },
  {
    question: 'Bagaimana kalau butuh fitur custom?',
    answer: 'Tiga pilihan: (1) Feature request ke product team — diprioritaskan di roadmap jika banyak yang butuh. (2) Custom development IDR 100K-500K per fitur. (3) Webhook + API — developer Anda bisa build integrasi sendiri dengan dokumentasi lengkap.',
  },
  {
    question: 'Bagaimana dengan compliance (UU PDP, GDPR)?',
    answer: 'UU PDP: data karyawan stored locally di Indonesia, encryption at rest & in transit, audit log lengkap. GDPR: data residency + consent management untuk employee di EU. SOC2 sedang dalam proses (target Q1 2027).',
  },
  {
    question: 'Bisa customize approval workflow?',
    answer: 'Ya — multi-level approval dengan conditional routing, misalnya cuti <5 hari cukup manager, cuti >5 hari perlu manager + HR Director, advance payroll >IDR 50 juta perlu manager + HR + Finance Director. Setup drag-drop tanpa coding.',
  },
];

async function main() {
  console.log('Seeding dnPeople product...');

  const data = {
    tagline: 'Payroll & HR Jadi Mudah. Harga Terjangkau.',
    description: 'Capek manual payroll tiap bulan? Coding cuti sama absent di Excel? dnPeople otomasi semua itu — payroll, leave, attendance, talent development, semua dalam satu dashboard yang simpel. Ratusan perusahaan manufaktur, retail, dan startup sudah pakai dnPeople, mulai dari startup 10 orang sampai perusahaan 5000+ karyawan.',
    longFormContent: [
      '## Kenapa HR Teams Milih dnPeople?',
      '',
      '**Hemat hingga 80% dari Vendor enterprise** — Vendor HRIS enterprise charge IDR 100-150K per karyawan per bulan, dnPeople hanya IDR 20-25K, fitur yang sama, harga 1/4 nya. Untuk 200 karyawan: hemat IDR 15-18 juta per bulan, atau IDR 180-216 juta setahun.',
      '',
      '**Payroll, Talent Dev, Customization — semuanya included** — Tidak ada biaya tersembunyi atau fitur tambahan yang mahal. Semua tier punya payroll otomatis (BPJS, PPh 21, THR), talent development (IDP, 9-box matrix, succession planning), leave & attendance management, dan API untuk integrasi.',
      '',
      '**Tidak ada "Hubungi Sales"** — Harga di website adalah harga sebenarnya, tidak ada margin geser atau "hubungi sales untuk harga spesial". Transparent pricing memudahkan budget tahunan dan approval HR lebih cepat.',
    ].join('\n'),
    status: 'active' as const,
    featured: true,
    launchStatus: 'launched',
    freemiumEnabled: true,
    freeLimit: '100 karyawan',
    trialDays: 30,
    customerCount: '200+',
    pricingTiers: PRICING_TIERS,
    features: FEATURES,
    integrations: INTEGRATIONS,
    useCases: USE_CASES,
    testimonials: TESTIMONIALS,
    comparisonTable: COMPARISON_TABLE,
    roadmap: ROADMAP,
    primaryCta: PRIMARY_CTA,
    secondaryCtas: SECONDARY_CTAS,
    faq: FAQ,
    demoUrl: 'https://calendly.com/dntech/demo',
    pricingCalcUrl: '/contact?product=dnpeople&intent=pricing-calculator',
    seoTitle: 'dnPeople — Payroll & HR Jadi Mudah, Harga Terjangkau',
    seoDescription: 'Solusi HRIS untuk SME Indonesia. Kelola karyawan, payroll, dan talent development di satu platform. Harga 1/4 dari Vendor enterprise, tanpa biaya tersembunyi.',
    keywords: 'HRIS Indonesia, payroll software, talent development, aplikasi HR SME, HRIS harga terjangkau',
  };

  const product = await prisma.product.upsert({
    where: { slug: 'dnpeople' },
    create: { name: 'dnPeople', slug: 'dnpeople', category: 'HRIS', ...data },
    update: data,
  });

  console.log(`dnPeople product seeded: ${product.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
