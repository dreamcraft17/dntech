/**
 * Hapus semua konten demo dari database.
 * Admin user & site_settings tetap dipertahankan.
 *
 * Usage: npx tsx scripts/clear-content.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Menghapus semua konten demo...');

  await prisma.$transaction([
    prisma.analyticsEvent.deleteMany(),
    prisma.conversionFunnel.deleteMany(),
    prisma.quizSubmission.deleteMany(),
    prisma.newsletterSubscriber.deleteMany(),
    prisma.formSubmission.deleteMany(),
    prisma.blogPost.deleteMany(),
    prisma.portfolioItem.deleteMany(),
    prisma.service.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.faq.deleteMany(),
    prisma.career.deleteMany(),
  ]);

  console.log('Konten demo berhasil dihapus.');
  console.log('Admin & pengaturan situs tetap ada. Isi konten via /admin');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
