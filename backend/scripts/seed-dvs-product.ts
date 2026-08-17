/**
 * Seed DuaVulnScanner (DVS) product page.
 * Source: company-wiki/docs/products/dvs/
 * Run: npx tsx scripts/seed-dvs-product.ts
 */
import { prisma, upsertProduct } from './product-seed-shared';

const PRICING_TIERS = [
  {
    id: 'community',
    name: 'Community',
    icon: 'gift',
    tagline: 'Self-hosted MVP',
    popular: false,
    featured: false,
    pricing: { amount: 0, currency: 'IDR', billingPeriod: 'forever', description: 'Self-hosted · passive scanner only' },
    features: ['Passive web scanner', 'Findings CRUD', 'HTML report export', 'RBAC (Admin/Tester/Viewer)', 'Audit log basic'],
    cta: { label: 'Request Access', url: '/contact?product=dvs', type: 'contact' },
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: 'shield',
    tagline: 'Security team internal',
    popular: true,
    featured: true,
    pricing: { amount: 2500000, currency: 'IDR', billingPeriod: 'per bulan', description: 'Hosted · unlimited scans · PDF reports' },
    features: [
      'Everything di Community +',
      'Scheduled scans',
      'PDF & Markdown export',
      'Workflow New→Verified',
      'Compliance tags (OWASP/UU PDP)',
      'Priority support',
    ],
    cta: { label: 'Book Demo', url: 'https://calendly.com/dntech/demo', type: 'demo' },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: 'crown',
    tagline: 'DevSecOps & pentest firm',
    popular: false,
    featured: false,
    pricing: { amount: null, currency: 'IDR', billingPeriod: 'custom', description: 'CI/CD integration · white-label · SLA' },
    features: [
      'Everything di Professional +',
      'CI/CD API integration',
      'White-label reports',
      'Multi-team management',
      'Dedicated account manager',
      'Custom scan policies',
    ],
    cta: { label: 'Konsultasi Enterprise', url: 'https://calendly.com/dntech/enterprise', type: 'demo' },
  },
];

const FEATURES = [
  {
    category: 'Scanner',
    icon: 'search',
    features: [
      { name: 'Passive Web Scanner', description: 'Headers, cookies, TLS hints, form discovery, misconfig detection' },
      { name: 'API Security Checks', description: 'Auth header, CORS, rate-limit soft probe' },
      { name: 'Manual Scan Start', description: 'Trigger scan on-demand dengan scope definition' },
    ],
  },
  {
    category: 'Reporting',
    icon: 'file-text',
    features: [
      { name: 'Executive Summary', description: '1-pager HTML untuk stakeholder non-teknis' },
      { name: 'Detailed Findings', description: 'Severity, CVSS, remediation steps per finding' },
      { name: 'Export HTML/PDF/Markdown', description: 'Multiple format untuk client delivery' },
      { name: 'Compliance Mapping', description: 'OWASP, CWE, UU PDP tags (soft MVP)' },
    ],
  },
  {
    category: 'Tracking & Workflow',
    icon: 'git-branch',
    features: [
      { name: 'Findings Management', description: 'CRUD + severity/CVSS + assign + comments' },
      { name: 'Scan Management', description: 'Test/scan lifecycle dengan history' },
      { name: 'Workflow States', description: 'New → In Progress → Verified / Accepted Risk' },
      { name: 'Analytics Dashboard', description: 'Severity breakdown, trend, remediation progress' },
    ],
  },
];

async function main() {
  console.log('Seeding DuaVulnScanner product...');

  const product = await upsertProduct({
    name: 'DuaVulnScanner',
    slug: 'duavulnscanner',
    category: 'Security',
    displayOrder: 5,
    description:
      'All-in-one penetration testing platform — Scanner + Reporting + Tracking dalam satu platform self-hosted. Compliance-aware (UU PDP / OWASP), API-first untuk CI/CD.',
    data: {
      tagline: 'Scan. Report. Track. All-in-One.',
      longFormContent: [
        '## Pentest Platform untuk Security Team',
        '',
        'DuaVulnScanner (DVS) menggabungkan passive web scanner, findings tracking, dan report generation — bukan sekadar CLI tool.',
        '',
        '**Ethics-first:** MVP scanner passive only (headers/cookies/TLS). Active exploit payloads gated by policy.',
        '',
        '**Self-hosted** di VPS DN Tech — data tetap di infrastruktur Anda.',
      ].join('\n'),
      status: 'active',
      featured: false,
      launchStatus: 'beta',
      freemiumEnabled: false,
      trialDays: 14,
      pricingTiers: PRICING_TIERS,
      features: FEATURES,
      useCases: [
        {
          id: 'security-tester',
          segment: 'Security Tester',
          icon: 'shield',
          description: 'Jalankan scan, review findings, export report untuk client.',
          uniqueFeatures: ['Passive scanner', 'Finding workflow', 'Report export'],
          cta: { label: 'Request Demo', url: 'https://calendly.com/dntech/demo' },
        },
        {
          id: 'devsecops',
          segment: 'DevSecOps',
          icon: 'code',
          description: 'Integrasikan scan ke CI/CD pipeline via REST API.',
          uniqueFeatures: ['API-first', 'Scheduled scans', 'Compliance tags'],
          cta: { label: 'Hubungi Sales', url: '/contact?product=dvs' },
        },
      ],
      primaryCta: { label: 'Book Demo', url: 'https://calendly.com/dntech/demo', type: 'demo', color: 'blue', size: 'lg' },
      secondaryCtas: [{ label: 'Lihat Pricing', url: '#pricing', type: 'link' }],
      demoUrl: 'https://calendly.com/dntech/demo',
      seoTitle: 'DuaVulnScanner — Platform Pentest All-in-One',
      seoDescription: 'Passive web scanner + findings tracking + report export. Self-hosted, compliance-aware (UU PDP/OWASP), API-first untuk DevSecOps.',
      keywords: 'penetration testing platform, vulnerability scanner Indonesia, DVS, pentest tool, DevSecOps',
      faq: [
        {
          question: 'Apakah scanner ini aman dipakai?',
          answer: 'MVP hanya passive scan (headers, cookies, TLS, misconfig). Tidak ada weaponized exploit payloads di public repo.',
        },
        {
          question: 'Bisa integrasi CI/CD?',
          answer: 'Ya, REST API tersedia. Enterprise tier includes CI/CD integration support.',
        },
      ],
      roadmap: [
        { quarter: 'Q3 2026', status: 'launched', features: [{ name: 'MVP Week 1', description: 'Passive scanner + findings + HTML report' }] },
        { quarter: 'Q4 2026', status: 'planned', features: [{ name: 'Workflow & PDF', description: 'Full workflow states + PDF export' }] },
        { quarter: 'Q1 2027', status: 'planned', features: [{ name: 'Infrastructure Scan', description: 'SSH/SSL/ports scanner module' }] },
      ],
    },
  });

  console.log(`DuaVulnScanner product seeded: ${product.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
