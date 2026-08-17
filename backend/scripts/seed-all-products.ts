/**
 * Seed all DN Tech products (except DOVA).
 * Run from backend/: npm run db:seed-products
 */
import { execSync } from 'child_process';
import path from 'path';

const SCRIPTS = [
  'seed-dnpeople-product.ts',
  'seed-dncore-product.ts',
  'seed-dnshop-product.ts',
  'seed-nearwork-product.ts',
  'seed-dvs-product.ts',
  'seed-threads-automation-product.ts',
  'seed-trusted-jurist-product.ts',
];

async function main() {
  console.log('Seeding all DN Tech products (excluding DOVA)...\n');

  for (const script of SCRIPTS) {
    const scriptPath = path.join(__dirname, script);
    console.log(`--- ${script} ---`);
    execSync(`npx tsx "${scriptPath}"`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('');
  }

  console.log(`Done. ${SCRIPTS.length} products seeded.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
