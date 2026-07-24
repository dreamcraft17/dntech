/**
 * Disables the default seed admin account (admin@dntech.id) after the real
 * admin password has been changed. Safe to run multiple times.
 * Run: npx tsx scripts/disable-seed-admin.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const seedEmail = process.env.ADMIN_EMAIL || 'admin@dntech.id';

  const admin = await prisma.user.findUnique({ where: { email: seedEmail } });
  if (!admin) {
    console.log(`✓ No seed admin found for ${seedEmail}, nothing to disable`);
    return;
  }

  if (!admin.isActive) {
    console.log(`✓ ${seedEmail} is already disabled`);
    return;
  }

  const activeSuperAdmins = await prisma.user.count({
    where: { role: 'SuperAdmin', isActive: true, email: { not: seedEmail } },
  });

  if (activeSuperAdmins === 0) {
    console.error(
      `❌ Refusing to disable ${seedEmail}: it is the only active SuperAdmin. Create a replacement SuperAdmin first.`
    );
    process.exit(1);
  }

  await prisma.user.update({
    where: { email: seedEmail },
    data: { isActive: false },
  });

  console.log(`✓ Disabled seed admin account: ${seedEmail}`);
}

main()
  .catch((error) => {
    console.error('❌ Failed to disable seed admin:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
