/**
 * Seed homepage PRD defaults — tagline, hero, homeContent JSON, and FAQ items.
 * Run from backend/: npx ts-node scripts/seed-homepage.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_HERO = {
  title: 'Jasa Custom Software Development untuk Startup & UMKM Indonesia',
  supporting:
    'Kami software house lokal yang build custom software untuk startup dan UMKM. Proses jelas, harga transparan, timeline yang pasti.',
  badges: ['Web Apps', 'Mobile Apps', 'Custom Solutions'],
};

const DEFAULT_FAQ = [
  {
    question: 'Berapa harga development?',
    answer:
      'Tergantung scope. MVP typical: Rp 150 juta – Rp 750 juta. Kami bahas detail di konsultasi gratis — tanpa tekanan.',
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
      companyEmail: 'hello@dntech.id',
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
