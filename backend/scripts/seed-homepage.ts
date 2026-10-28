/**
 * Seed homepage PRD defaults — tagline, hero, homeContent JSON, and FAQ items.
 * Run from backend/: npx ts-node scripts/seed-homepage.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_HERO = {
  title: 'Bisnis Makin Tumbuh, Sistem Jangan Ikut Berantakan',
  supporting:
    'DN Tech adalah software house Indonesia: custom software (website, web app, mobile, integrasi sistem) dan produk SaaS first-party yang kami bangun sendiri. Kami bantu bisnis merapikan operasional lewat software — dengan scope, harga, dan timeline yang disepakati sebelum development.',
  badges: ['Website & Company Profile', 'Aplikasi Custom', 'Integrasi Sistem'],
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
      'MVP produk lengkap (banyak modul, integrasi, rollout) biasanya 3–6 bulan. Proyek custom dengan scope sudah terkunci — misalnya company profile, satu workflow, atau integrasi tunggal — sering masuk rentang 1–4 bulan seperti paket Custom Project di homepage. Timeline pasti ditulis di proposal sebelum kick-off.',
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
      'Produk first-party — dnPeople (HRIS), dnCore (ERP), dnShop Finance (seller Shopee + pembukuan), dnFinance (cloud accounting SME) — dibangun dari workflow nyata. Nama resmi, status rilis, fitur, dan harga ada di halaman masing-masing produk.',
    hiringEmail: 'careers@dntech.id',
  };

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      tagline: DEFAULT_HERO.title,
      heroDescription: DEFAULT_HERO.supporting,
      homeContent,
      companyPhone: '+62 81232037001',
    },
    create: {
      id: 1,
      companyName: 'DN Tech',
      tagline: DEFAULT_HERO.title,
      heroDescription: DEFAULT_HERO.supporting,
      companyEmail: 'info@dntech.id',
      companyPhone: '+62 81232037001',
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
