import type { PublicSettings } from '@/lib/settings';

export interface HomeStep {
  step: number;
  title: string;
  description: string;
}

export interface HomeAdvantage {
  title: string;
  description: string;
}

export interface HomeTechCategory {
  category: string;
  items: string[];
}

export interface HomePricingPlan {
  name: string;
  price: string;
  timeline?: string;
  included: string[];
}

export interface HomeServiceCard {
  name: string;
  description: string;
  slug?: string;
}

export interface HomeContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadges?: string[];
  heroSupporting?: string;
  processSteps?: HomeStep[];
  advantages?: HomeAdvantage[];
  techStack?: HomeTechCategory[];
  pricing?: HomePricingPlan[];
  defaultServices?: HomeServiceCard[];
  hiringRoles?: string[];
  hiringEmail?: string;
  portfolioMessage?: string;
  testimonialsMessage?: string;
}

export const DEFAULT_HERO = {
  title: 'Jasa Custom Software Development untuk Startup & UMKM Indonesia',
  badges: ['Web Apps', 'Mobile Apps', 'Custom Solutions'],
  supporting:
    'Kami software house lokal yang build custom software untuk startup dan UMKM. Proses jelas, harga transparan, timeline yang pasti.',
};

export const DEFAULT_HOME_SERVICES: HomeServiceCard[] = [
  {
    name: 'Web App Development',
    description: 'Dashboard, portal, dan web application modern untuk operasional bisnis Anda.',
  },
  {
    name: 'Mobile App Development',
    description: 'Aplikasi iOS & Android untuk menjangkau pelanggan di mana saja.',
  },
  {
    name: 'Custom Software',
    description: 'Solusi sesuai kebutuhan bisnis Anda — dari MVP sampai sistem operasional.',
  },
  {
    name: 'Maintenance & Support',
    description: 'Update berkala, perbaikan bug, dan optimasi performa setelah go live.',
  },
  {
    name: 'Technical Consulting',
    description: 'Diskusi arsitektur, strategi teknologi, dan feasibility sebelum development.',
  },
  {
    name: 'Integration & API Development',
    description: 'Integrasi dengan sistem existing, custom API, dan koneksi third-party.',
  },
];

export const DEFAULT_PROCESS_STEPS: HomeStep[] = [
  {
    step: 1,
    title: 'Hubungi Kami',
    description:
      'WA, email, atau form. Konsultasi awal gratis 30 menit. Kita diskusikan apa yang Anda butuhkan.',
  },
  {
    step: 2,
    title: 'Scope & Quote',
    description:
      'Kami buat proposal: apa yang akan dibangun, berapa lama, dan berapa harganya — tanpa hidden fees.',
  },
  {
    step: 3,
    title: 'Kick-off',
    description: 'Setelah approval, development dimulai dengan timeline jelas: kapan mulai, kapan selesai.',
  },
  {
    step: 4,
    title: 'Development + Check-in',
    description:
      'Kerja dalam sprint 2 minggu. Update mingguan untuk Anda. Perubahan dalam scope bisa didiskusikan.',
  },
  {
    step: 5,
    title: 'QA & Testing',
    description:
      'Sebelum launch, semua ditest (fungsi, keamanan, mobile). Anda approve sebelum go live.',
  },
  {
    step: 6,
    title: 'Launch & Support',
    description:
      'Deploy ke production. Termasuk training, 30 hari free bug fix, dan paket support berkelanjutan.',
  },
];

export const DEFAULT_ADVANTAGES: HomeAdvantage[] = [
  {
    title: 'Harga Transparan',
    description: 'Tidak ada hidden fees. Anda tahu biaya pasti dari awal — tanpa surprise billing.',
  },
  {
    title: 'Timeline Jelas',
    description: 'Kami sampaikan kapan selesai dan berusaha tepat waktu agar Anda bisa planning dengan pasti.',
  },
  {
    title: 'Bisa Hubungi Langsung',
    description: 'Kerja langsung dengan tim. Dozer (founder) terlibat di project penting — tanpa middleman.',
  },
  {
    title: 'Tech Stack Modern',
    description:
      'React, Next.js, PostgreSQL — stack yang kami pakai di produk first-party. Dirancang untuk skala produk SaaS, bukan demo sekali pakai.',
  },
  {
    title: 'Support Sesudah Launch',
    description: 'Kami tidak hilang setelah go live. Ada paket maintenance untuk dukungan berkelanjutan.',
  },
  {
    title: 'Lokal, Paham Konteks',
    description: 'Berkantor di Indonesia. Timezone sama, bahasa sama, paham konteks bisnis lokal.',
  },
];

export const DEFAULT_TECH_STACK: HomeTechCategory[] = [
  { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
  { category: 'Backend', items: ['Node.js', 'Express', 'Python', 'FastAPI', 'NestJS'] },
  { category: 'Database', items: ['PostgreSQL', 'MongoDB', 'Redis'] },
  { category: 'Infrastructure', items: ['AWS', 'DigitalOcean', 'Docker', 'GitHub Actions'] },
  {
    category: 'Payments & Integrations',
    items: ['Stripe', 'BCA API', 'Mandiri API', 'SendGrid'],
  },
  { category: 'Deployment', items: ['Vercel', 'DigitalOcean App', 'AWS Lambda'] },
];

export const DEFAULT_PRICING: HomePricingPlan[] = [
  {
    name: 'Custom Project',
    price: 'Mulai Rp 25 juta',
    timeline: '1–4 bulan (sesuai scope)',
    included: ['Design', 'Development', 'Testing', '30 hari support pasca-launch'],
  },
  {
    name: 'Hourly Consulting',
    price: 'Mulai Rp 150.000/jam',
    included: ['Strategy & arsitektur', 'Feasibility review', 'Quick technical tasks'],
  },
  {
    name: 'Maintenance Package',
    price: 'Mulai Rp 2 juta/bulan',
    included: ['Update bulanan', 'Bug fixes', 'Monitoring dasar'],
  },
];

export const DEFAULT_FAQ: { question: string; answer: string }[] = [
  {
    question: 'Berapa harga development?',
    answer:
      'Tergantung scope. Landing page / fitur sederhana bisa mulai Rp 25 juta; MVP lebih lengkap biasanya Rp 50–150 juta. Kami bahas detail di konsultasi gratis — tanpa tekanan.',
  },
  {
    question: 'Berapa lama timeline?',
    answer:
      'MVP typical: 3–6 bulan, tergantung kompleksitas. Timeline pasti disampaikan di proposal sebelum kick-off.',
  },
  {
    question: 'Bisa mulai kapan?',
    answer: 'Biasanya bisa mulai dalam 2–4 minggu setelah agreement ditandatangani.',
  },
  {
    question: 'Apa garansi kualitas?',
    answer: 'Code review ketat, testing menyeluruh, dan 30 hari free bug fix setelah launch.',
  },
  {
    question: 'Siapa yang handle project saya?',
    answer: 'Tim DN Tech + Dozer (founder) di project penting — bukan didelegasikan semata ke junior tanpa supervisi.',
  },
  {
    question: 'Bagaimana kalau butuh perubahan setelah launch?',
    answer:
      '30 hari free bug fix. Setelah itu: paket maintenance bulanan atau Anda bebas hire developer lain — kode adalah milik Anda.',
  },
  {
    question: 'Startup saya belum ada budget besar, bisa?',
    answer:
      'Bisa. Kami tawarkan hourly consulting, revenue share untuk project yang cocok, atau skema fleksibel sesuai situasi Anda.',
  },
  {
    question: 'Bisa konsultasi gratis dulu?',
    answer: 'Tentu. 30 menit gratis untuk diskusi kebutuhan. No pressure — Anda putuskan setelahnya.',
  },
];

export const DEFAULT_HIRING_ROLES = [
  'Senior Frontend Developer',
  'Backend Engineer',
  'QA Engineer',
];

function asHomeContent(raw: unknown): HomeContent {
  if (!raw || typeof raw !== 'object') return {};
  return raw as HomeContent;
}

export function resolveHomeContent(settings: PublicSettings): Required<
  Pick<
    HomeContent,
    | 'heroTitle'
    | 'heroSubtitle'
    | 'heroBadges'
    | 'heroSupporting'
    | 'processSteps'
    | 'advantages'
    | 'techStack'
    | 'pricing'
    | 'defaultServices'
    | 'hiringRoles'
    | 'hiringEmail'
    | 'portfolioMessage'
    | 'testimonialsMessage'
  >
> {
  const cms = asHomeContent(settings.homeContent);

  return {
    heroTitle: cms.heroTitle || settings.tagline || DEFAULT_HERO.title,
    heroSubtitle: cms.heroSubtitle || 'DN Tech.id',
    heroBadges: cms.heroBadges?.length ? cms.heroBadges : DEFAULT_HERO.badges,
    heroSupporting: cms.heroSupporting || settings.heroDescription || DEFAULT_HERO.supporting,
    processSteps: cms.processSteps?.length ? cms.processSteps : DEFAULT_PROCESS_STEPS,
    advantages: cms.advantages?.length ? cms.advantages : DEFAULT_ADVANTAGES,
    techStack: cms.techStack?.length ? cms.techStack : DEFAULT_TECH_STACK,
    pricing: cms.pricing?.length ? cms.pricing : DEFAULT_PRICING,
    defaultServices: cms.defaultServices?.length ? cms.defaultServices : DEFAULT_HOME_SERVICES,
    hiringRoles: cms.hiringRoles?.length ? cms.hiringRoles : DEFAULT_HIRING_ROLES,
    hiringEmail: cms.hiringEmail || settings.companyEmail || 'careers@dntech.id',
    portfolioMessage:
      cms.portfolioMessage ||
      'Studi kasus publik akan muncul di sini setelah klien memberi izin. Sementara itu, lihat produk first-party di halaman Produk.',
    testimonialsMessage:
      cms.testimonialsMessage ||
      'Belum ada testimoni publik. Kami hanya mempublikasikan kutipan dengan izin tertulis.',
  };
}
