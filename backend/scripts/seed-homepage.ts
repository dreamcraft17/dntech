/**
 * Seed homepage PRD defaults — tagline, hero, homeContent JSON, and FAQ items.
 * Run from backend/: npx ts-node scripts/seed-homepage.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_HERO = {
  title: 'Bangun Software untuk Workflow yang Penting',
  supporting:
    'DN Tech membantu startup dan bisnis Indonesia membangun MVP, menghubungkan sistem, dan merapikan workflow operasional — dengan scope, timeline, dan harga yang jelas sejak awal.',
  badges: ['MVP & Product Engineering', 'Workflow & Integrasi', 'Produk First-Party'],
};

const DEFAULT_FAQ = [
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
    answer:
      'Tim DN Tech + Dozer (founder) di project penting — bukan didelegasikan semata ke junior tanpa supervisi.',
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

async function main() {
  console.log('Seeding homepage PRD content...');

  const homeContent = {
    heroTitle: DEFAULT_HERO.title,
    heroBadges: DEFAULT_HERO.badges,
    heroSupporting: DEFAULT_HERO.supporting,
    heroPrimaryCta: { label: 'Konsultasi Gratis — 30 Menit', href: '/contact' },
    heroSecondaryCta: { label: 'Lihat Produk', href: '/products' },
    productsTitle: 'Produk yang Membuktikan Cara Kami Bekerja',
    productsSubtitle:
      'dnPeople (HRIS), dnCore (ERP), dan dnShop kami bangun untuk workflow bisnis nyata. Lihat fitur, harga, status rilis, dan cara setiap produk membantu tim bekerja lebih rapi.',
    hiringEmail: 'careers@dntech.id',
  };

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      tagline: DEFAULT_HERO.title,
      heroDescription: DEFAULT_HERO.supporting,
      homeContent,
    },
    create: {
      id: 1,
      companyName: 'DN Tech',
      tagline: DEFAULT_HERO.title,
      heroDescription: DEFAULT_HERO.supporting,
      companyEmail: 'info@dntech.id',
      homeContent,
    },
  });

  for (let i = 0; i < DEFAULT_FAQ.length; i++) {
    const faq = DEFAULT_FAQ[i];
    const existing = await prisma.faq.findFirst({
      where: { question: faq.question },
    });
    if (!existing) {
      await prisma.faq.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          category: 'Beranda',
          displayOrder: i,
          isActive: true,
        },
      });
    }
  }

  console.log('Homepage seed completed.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
