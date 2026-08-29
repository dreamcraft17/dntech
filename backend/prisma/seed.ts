import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { resolveAdminPassword } from '../src/utils/adminPassword';

const prisma = new PrismaClient();

/**
 * Production bootstrap seed — creates admin user and empty site settings only.
 * All content (services, blog, team, etc.) must be added via Admin Dashboard.
 */
async function main() {
  console.log('Bootstrapping production database...');

  const passwordHash = await bcrypt.hash(resolveAdminPassword(), 12);
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dntech.id';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, isActive: true },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Administrator',
      role: 'SuperAdmin',
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: process.env.COMPANY_NAME || 'DN Tech',
    },
  });

  console.log('Bootstrap completed.');
  console.log(`Admin: ${adminEmail}`);
  console.log('Add content via Admin Dashboard at /admin/login');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
