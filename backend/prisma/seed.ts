import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { resolveAdminPassword, shouldRotateAdminPassword } from '../src/utils/adminPassword';

const prisma = new PrismaClient();

/**
 * Production bootstrap seed — creates admin user and empty site settings only.
 * Existing admin hashes are left alone unless ROTATE_ADMIN=1 (db-vps.sh seed sets this).
 * All content (services, blog, team, etc.) must be added via Admin Dashboard.
 */
async function main() {
  console.log('Bootstrapping production database...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dntech.id';
  const rotate = shouldRotateAdminPassword();
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const passwordHash = await bcrypt.hash(resolveAdminPassword(), 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Administrator',
        role: 'SuperAdmin',
      },
    });
  } else if (rotate) {
    const passwordHash = await bcrypt.hash(resolveAdminPassword(), 12);
    await prisma.user.update({
      where: { email: adminEmail },
      data: { passwordHash, isActive: true },
    });
  } else {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { isActive: true },
    });
    console.log('Admin exists; hash unchanged (set ROTATE_ADMIN=1 to rotate).');
  }

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
