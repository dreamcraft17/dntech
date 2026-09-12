/**
 * Seed Kebijakan Privasi and Syarat & Ketentuan HTML into SiteSettings.
 * Source: dntech/legal/*.html
 * Run from backend/: npm run db:seed-legal
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function readLegal(file: string): string {
  return readFileSync(join(__dirname, '../../legal', file), 'utf8');
}

async function main() {
  const privacyContent = readLegal('privacy.html');
  const termsContent = readLegal('terms.html');

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { privacyContent, termsContent },
    create: {
      id: 1,
      companyName: 'DN Tech',
      companyEmail: 'info@dntech.id',
      privacyContent,
      termsContent,
    },
  });

  console.log('Legal pages seeded (privacy + terms).');
}

main()
  .catch((err) => {
    console.error('Legal seed failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
