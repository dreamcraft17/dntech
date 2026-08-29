/**
 * Seed dnCore ERP product page.
 * Source: company-wiki/docs/products/dnpeople-erp/
 * Run: npx tsx scripts/seed-dncore-product.ts
 */
import { prisma, upsertProduct } from './product-seed-shared';

const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Gratis',
    icon: 'gift',
    tagline: 'Core modules untuk startup',
    popular: false,
    featured: false,
    pricing: { amount: 0, currency: 'IDR', billingPeriod: 'forever', description: 'Sampai 100 karyawan · modul dasar' },
    features: ['Chart of Accounts + GL dasar', 'Sales order & quotation', 'Inventory basic', 'Dashboard operasional', 'Multi-tenant ready'],
    cta: { label: 'Hubungi Kami', url: 'https://calendly.com/dntech/demo', type: 'demo' },
  },
  {
    id: 'starter',
    name: 'Starter',
    icon: 'rocket',
    tagline: 'SME 50–200 karyawan',
    popular: false,
    featured: false,
    pricing: { amount: 20000, currency: 'IDR', billingPeriod: 'per karyawan per bulan', description: 'Finance + Sales + SC dasar' },
    features: ['AP/AR & bank reconciliation', 'Purchase & sales workflow', 'e-Faktur export', 'Basic reporting', 'Email support'],
    cta: { label: 'Coba Demo', url: 'https://calendly.com/dntech/demo', type: 'demo' },
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: 'star',
    tagline: 'Recommended untuk mid-market',
    popular: true,
    featured: true,
    pricing: { amount: 25000, currency: 'IDR', billingPeriod: 'per karyawan per bulan', description: 'Semua modul operasional + analytics' },
    features: [
      'Everything di Starter +',
      'Manufacturing & MRP',
      'Workflow engine + SLA',
      'CRM & pipeline',
      'Advanced analytics & OLAP',
      'Integrasi dnPeople HRIS',
    ],
    cta: { label: 'Pilih Professional', url: 'https://calendly.com/dntech/demo', type: 'demo' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: 'crown',
    tagline: '500+ karyawan · custom deployment',
    popular: false,
    featured: false,
    pricing: { amount: null, currency: 'IDR', billingPeriod: 'custom', description: 'Volume discount + dedicated support' },
    features: [
      'Everything di Professional +',
      'Schema-per-tenant option',
      'Dedicated account manager',
      'Custom industry templates',
      'On-prem / hybrid deployment',
      'SLA 99.5% uptime',
    ],
    cta: { label: 'Konsultasi Enterprise', url: 'https://calendly.com/dntech/enterprise', type: 'demo' },
  },
];

const FEATURES = [
  {
    category: 'Finance & Compliance',
    icon: 'calculator',
    features: [
      { name: 'General Ledger & COA', description: 'SAK-EP compliant, multi-currency, intercompany' },
      { name: 'AP/AR & Bank Reconciliation', description: 'Auto-matching mutasi bank + dunning automation' },
      { name: 'e-Faktur & PPh 21', description: 'Export compliance Indonesia built-in' },
      { name: 'Financial Statements', description: 'Balance sheet, P&L, cash flow real-time' },
    ],
  },
  {
    category: 'Supply Chain & Manufacturing',
    icon: 'factory',
    features: [
      { name: 'Inventory & Warehouse', description: 'Multi-location, lot tracking, stock valuation' },
      { name: 'Purchase & Sales', description: 'PO → GRN → invoice, quotation → delivery → AR' },
      { name: 'MRP & Production', description: 'BOM, work orders, capacity planning' },
      { name: 'Shipping Integration', description: 'JNE, Sicepat tracking hooks' },
    ],
  },
  {
    category: 'CRM & Workflow',
    icon: 'workflow',
    features: [
      { name: 'CRM Pipeline', description: 'Lead → opportunity → quotation → order' },
      { name: 'Workflow Engine', description: 'Multi-level approval dengan SLA & escalation' },
      { name: 'Custom Reports', description: 'Report builder + scheduled exports' },
      { name: 'Analytics Dashboard', description: 'OLAP cubes, KPI widgets, drill-down' },
    ],
  },
  {
    category: 'Platform & Integrasi',
    icon: 'code',
    features: [
      { name: 'Multi-tenant Architecture', description: 'Row-level atau schema-per-tenant' },
      { name: 'dnPeople HRIS Sync', description: 'Payroll subset terintegrasi dengan HRIS flagship' },
      { name: 'REST API', description: 'Open API untuk integrasi pihak ketiga' },
      { name: 'Audit Log', description: 'Full audit trail untuk compliance UU PDP' },
    ],
  },
];

async function main() {
  console.log('Seeding dnCore product...');

  const product = await upsertProduct({
    name: 'dnCore',
    slug: 'dncore',
    category: 'ERP',
    displayOrder: 2,
    description:
      'ERP terintegrasi untuk SME Indonesia — finance, supply chain, manufacturing, CRM, dan workflow dalam satu platform. Komplementer dengan dnPeople HRIS: dnPeople untuk people, dnCore untuk business operations.',
    data: {
      tagline: 'ERP keuangan, stok, dan proyek dalam satu platform.',
      longFormContent: [
        '## dnPeople untuk People · dnCore untuk Business',
        '',
        'dnCore adalah enterprise ERP multi-tenant yang dibangun untuk SME dan mid-market Indonesia. 27 modul domain, 86 entities, 408 unit tests — production-grade architecture tanpa kompleksitas SAP.',
        '',
        '**Integrasi native dengan dnPeople** — payroll subset, employee master sync, unified tenant management.',
        '',
        '**Indonesia-first compliance** — e-Faktur, PPh 21, SAK-EP, UU PDP audit log built-in.',
      ].join('\n'),
      status: 'active',
      featured: true,
      showOnHomepage: true,
      launchStatus: 'beta',
      freemiumEnabled: true,
      freeLimit: '100 karyawan',
      trialDays: 30,
      customerCount: 'Beta',
      pricingTiers: PRICING_TIERS,
      features: FEATURES,
      integrations: [
        { name: 'dnPeople HRIS', category: 'HR', description: 'Sync employee & payroll data', status: 'available' },
        { name: 'JNE', category: 'Shipping', description: 'Delivery tracking integration', status: 'available' },
        { name: 'Sicepat', category: 'Shipping', description: 'Courier integration', status: 'available' },
        { name: 'BCA API', category: 'Banking', description: 'Bank statement import', status: 'coming_soon' },
      ],
      useCases: [
        {
          id: 'retail',
          segment: 'Retail & Distribusi',
          icon: 'shopping-bag',
          description: 'Kelola inventory multi-gudang, sales order, AR, dan laporan keuangan real-time.',
          uniqueFeatures: ['Multi-warehouse inventory', 'Volume pricing', 'Credit limit enforcement'],
          cta: { label: 'Demo Retail', url: 'https://calendly.com/dntech/demo' },
        },
        {
          id: 'manufacturing',
          segment: 'Manufaktur',
          icon: 'factory',
          description: 'MRP, BOM, work orders, dan production planning terintegrasi dengan GL.',
          uniqueFeatures: ['MRP engine', 'Capacity planning', 'Quality control hooks'],
          cta: { label: 'Demo Manufaktur', url: 'https://calendly.com/dntech/demo' },
        },
        {
          id: 'services',
          segment: 'Professional Services',
          icon: 'briefcase',
          description: 'Project billing, timesheet, CRM pipeline, dan financial reporting.',
          uniqueFeatures: ['Project costing', 'CRM pipeline', 'Workflow approvals'],
          cta: { label: 'Demo Services', url: 'https://calendly.com/dntech/demo' },
        },
      ],
      primaryCta: { label: 'Jadwalkan Demo', url: 'https://calendly.com/dntech/demo', type: 'demo', color: 'blue', size: 'lg' },
      secondaryCtas: [
        { label: 'Lihat Pricing', url: '#pricing', type: 'link' },
        { label: 'Hubungi Sales', url: '/contact?product=dncore', type: 'contact' },
      ],
      demoUrl: 'https://calendly.com/dntech/demo',
      seoTitle: 'dnCore — ERP Keuangan & Operasional untuk UKM',
      seoDescription: 'Finance, supply chain, manufacturing, CRM & workflow dalam satu platform. Komplementer dnPeople HRIS. Harga transparan, compliance Indonesia built-in.',
      keywords: 'ERP Indonesia, software ERP SME, dnCore, ERP UMKM, sistem keuangan terintegrasi',
      faq: [
        {
          question: 'Apa bedanya dnCore dengan dnPeople?',
          answer: 'dnPeople fokus HRIS & payroll. dnCore fokus operasional bisnis: finance, supply chain, manufacturing, CRM, workflow. Keduanya terintegrasi dalam ekosistem DN Tech.',
        },
        {
          question: 'Sudah production-ready?',
          answer: 'Phase 0–8 MVP+ sudah di-code (408 tests). Soft launch Q3 2026, public launch conditional setelah AWS live credentials ready.',
        },
        {
          question: 'Bisa deploy on-premise?',
          answer: 'Ya. Docker Compose supported untuk on-prem/hybrid deployment di tier Enterprise.',
        },
      ],
      roadmap: [
        { quarter: 'Q3 2026', status: 'in_progress', features: [{ name: 'Soft Launch Beta', description: 'Finance + SC + CRM core modules' }] },
        { quarter: 'Q4 2026', status: 'planned', features: [{ name: 'Public Launch', description: 'AWS live + reseller program' }] },
        { quarter: 'Q1 2027', status: 'planned', features: [{ name: 'Advanced Analytics', description: 'OLAP cubes + custom dashboards' }] },
      ],
    },
  });

  console.log(`dnCore product seeded: ${product.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
