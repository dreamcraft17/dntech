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

export interface HomeCta {
  label: string;
  href: string;
}

export interface HomeContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadges?: string[];
  heroSupporting?: string;
  heroPrimaryCta?: HomeCta;
  heroSecondaryCta?: HomeCta;
  productsTitle?: string;
  productsSubtitle?: string;
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
  title: 'Custom Software yang Selesai Tepat Waktu — Harga Jelas dari Awal',
  badges: ['Web Apps', 'Mobile Apps', 'Custom Solutions'],
  supporting:
    'Software house lokal untuk startup dan UMKM. Anda bicara langsung dengan tim yang mengerjakan project — bukan account manager — dan tahu biaya pastinya sebelum kerja dimulai.',
};

export const DEFAULT_HERO_PRIMARY_CTA: HomeCta = {
  label: 'Konsultasi Gratis — 30 Menit',
  href: '/contact',
};

export const DEFAULT_HERO_SECONDARY_CTA: HomeCta = {
  label: 'Lihat Produk',
  href: '/products',
};

export const DEFAULT_PRODUCTS_SECTION = {
  title: 'Produk software siap pakai',
  subtitle:
    'HRIS, ERP, dan pembukuan yang kami pakai sendiri setiap hari — bukan sekadar demo. Fitur, harga, dan status rilis tercantum di setiap halaman produk.',
};

export const DEFAULT_HOME_SERVICES: HomeServiceCard[] = [
  {
    name: 'Web App Development',
    description: 'Dashboard dan portal yang benar-benar dipakai tim Anda tiap hari untuk kerja, bukan sekadar demo.',
  },
  {
    name: 'Mobile App Development',
    description: 'Aplikasi iOS & Android yang pelanggan Anda buka setiap hari — cepat, stabil, siap App Store & Play Store.',
  },
  {
    name: 'Custom Software',
    description: 'Dari MVP untuk validasi ide sampai sistem operasional harian — dibangun sesuai proses bisnis Anda, bukan template generik.',
  },
  {
    name: 'Maintenance & Support',
    description: 'Setelah go live kami tetap ada: update berkala, perbaikan bug cepat, dan pemantauan performa.',
  },
  {
    name: 'Technical Consulting',
    description: 'Sebelum development dimulai, kami bantu cek arsitektur dan feasibility teknis — supaya uang Anda tidak terbuang di jalan yang salah.',
  },
  {
    name: 'Integration & API Development',
    description: 'Sambungkan sistem yang sudah Anda pakai lewat custom API dan integrasi pihak ketiga, tanpa mengganti semuanya dari nol.',
  },
];

export const DEFAULT_PROCESS_STEPS: HomeStep[] = [
  {
    step: 1,
    title: 'Hubungi Kami',
    description:
      'WA, email, atau form — pilih yang paling nyaman. Konsultasi awal 30 menit, gratis, tanpa sales pitch panjang.',
  },
  {
    step: 2,
    title: 'Scope & Quote',
    description:
      'Kami tulis proposal konkret: apa yang dibangun, berapa lama, dan berapa biayanya — angka final, bukan estimasi kasar.',
  },
  {
    step: 3,
    title: 'Kick-off',
    description: 'Setelah Anda approve, development langsung mulai dengan tanggal selesai yang sudah disepakati bersama.',
  },
  {
    step: 4,
    title: 'Development + Check-in',
    description:
      'Kerja dalam sprint 2 minggu, update progres tiap minggu ke Anda. Ada perubahan scope? Kita bahas sebelum jalan, bukan sesudah.',
  },
  {
    step: 5,
    title: 'QA & Testing',
    description:
      'Sebelum launch, kami test fungsi, keamanan, dan tampilan mobile. Anda yang kasih lampu hijau terakhir sebelum go live.',
  },
  {
    step: 6,
    title: 'Launch & Support',
    description:
      'Deploy ke production, training untuk tim Anda, 30 hari bug fix gratis, lalu lanjut ke paket support kalau dibutuhkan.',
  },
];

export const DEFAULT_ADVANTAGES: HomeAdvantage[] = [
  {
    title: 'Harga Transparan',
    description: 'Biaya pasti disepakati di awal, tertulis di proposal — tidak ada hidden fees atau surprise billing di tengah jalan.',
  },
  {
    title: 'Timeline Jelas',
    description: 'Tanggal mulai dan selesai disampaikan sebelum kick-off, supaya Anda bisa planning launch dengan pasti — bukan "insya Allah minggu depan".',
  },
  {
    title: 'Bisa Hubungi Langsung',
    description: 'Anda kerja langsung dengan tim yang menulis kodenya. Dozer (founder) turun tangan di project penting — tanpa lapisan account manager.',
  },
  {
    title: 'Tech Stack Modern',
    description:
      'React, Next.js, PostgreSQL — stack yang kami pakai di produk first-party. Dirancang untuk skala produk SaaS, bukan demo sekali pakai.',
  },
  {
    title: 'Support Sesudah Launch',
    description: 'Kami tidak hilang setelah invoice terakhir cair. Ada paket maintenance untuk dukungan yang berkelanjutan.',
  },
  {
    title: 'Lokal, Paham Konteks',
    description: 'Berkantor di Indonesia — timezone sama, bahasa sama, dan paham kenapa proses bisnis Anda berjalan seperti itu.',
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
    price: 'Tergantung Scope',
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

function asCta(raw: unknown, fallback: HomeCta): HomeCta {
  if (!raw || typeof raw !== 'object') return fallback;
  const candidate = raw as Record<string, unknown>;
  const label =
    typeof candidate.label === 'string' && candidate.label.trim()
      ? candidate.label.trim()
      : fallback.label;
  const href =
    typeof candidate.href === 'string' && candidate.href.trim()
      ? candidate.href.trim()
      : fallback.href;
  return { label, href };
}

export function resolveHomeContent(settings: PublicSettings): Required<
  Pick<
    HomeContent,
    | 'heroTitle'
    | 'heroSubtitle'
    | 'heroBadges'
    | 'heroSupporting'
    | 'heroPrimaryCta'
    | 'heroSecondaryCta'
    | 'productsTitle'
    | 'productsSubtitle'
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
    heroPrimaryCta: asCta(cms.heroPrimaryCta, DEFAULT_HERO_PRIMARY_CTA),
    heroSecondaryCta: asCta(cms.heroSecondaryCta, DEFAULT_HERO_SECONDARY_CTA),
    productsTitle: cms.productsTitle || DEFAULT_PRODUCTS_SECTION.title,
    productsSubtitle: cms.productsSubtitle || DEFAULT_PRODUCTS_SECTION.subtitle,
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
