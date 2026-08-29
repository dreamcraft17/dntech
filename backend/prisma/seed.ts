import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Production bootstrap seed — creates admin user and empty site settings only.
 * All content (services, blog, team, etc.) must be added via Admin Dashboard.
 */
function resolveAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD?.trim();
  const forbidden = new Set(['Admin@123456', 'admin@123456', 'password', 'changeme']);

  if (!password || password.length < 12 || forbidden.has(password)) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'ADMIN_PASSWORD must be set (min 12 chars, not a default) before bootstrap seed in production.',
      );
    }
    console.warn('WARNING: Set ADMIN_PASSWORD (min 12 chars) before production deploy.');
    return 'DevOnly-LocalBootstrap-ChangeMe!';
  }

  return password;
}

async function main() {
  console.log('Bootstrapping production database...');

  const passwordHash = await bcrypt.hash(resolveAdminPassword(), 12);

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@dntech.id' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@dntech.id',
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
  console.log(`Admin: ${process.env.ADMIN_EMAIL || 'admin@dntech.id'}`);
  console.log('Add content via Admin Dashboard at /admin/login');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
