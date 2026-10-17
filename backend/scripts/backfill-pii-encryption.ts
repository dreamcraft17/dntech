/**
 * Encrypts existing plaintext email/phone on FormSubmission, NewsletterSubscriber,
 * and QuizSubmission rows (written before field-level encryption was added —
 * see backend/src/utils/encryption.ts and docs/runbooks/PII-FIELD-ENCRYPTION.md),
 * and backfills the emailIndex blind-index column so duplicate-check/lookup
 * queries find these rows too.
 *
 * Idempotent: skips any row whose `email` already starts with "v1:" (already
 * encrypted), so it's safe to re-run or run repeatedly during a rollout.
 *
 * Usage:
 *   npx tsx scripts/backfill-pii-encryption.ts            # run for real
 *   npx tsx scripts/backfill-pii-encryption.ts --dry-run  # report counts only
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { encryptField, encryptFieldOrNull, blindIndex } from '../src/utils/encryption';

const prisma = new PrismaClient();

function parseArgs(argv: string[]) {
  return { dryRun: argv.includes('--dry-run') };
}

function isAlreadyEncrypted(value: string | null | undefined) {
  return !!value && value.startsWith('v1:');
}

async function backfillFormSubmissions(dryRun: boolean) {
  const all = await prisma.formSubmission.findMany({ select: { id: true, email: true, phone: true } });
  const rows = all.filter((r) => !isAlreadyEncrypted(r.email));
  console.log(`FormSubmission: ${rows.length} row(s) to encrypt`);
  if (dryRun) return;

  for (const row of rows) {
    await prisma.formSubmission.update({
      where: { id: row.id },
      data: {
        email: encryptField(row.email),
        emailIndex: blindIndex(row.email),
        phone: encryptFieldOrNull(row.phone),
      },
    });
  }
}

async function backfillNewsletterSubscribers(dryRun: boolean) {
  const all = await prisma.newsletterSubscriber.findMany({ select: { id: true, email: true } });
  const rows = all.filter((r) => !isAlreadyEncrypted(r.email));
  console.log(`NewsletterSubscriber: ${rows.length} row(s) to encrypt`);
  if (dryRun) return;

  for (const row of rows) {
    await prisma.newsletterSubscriber.update({
      where: { id: row.id },
      data: { email: encryptField(row.email), emailIndex: blindIndex(row.email) },
    });
  }
}

async function backfillQuizSubmissions(dryRun: boolean) {
  const all = await prisma.quizSubmission.findMany({ where: { email: { not: null } }, select: { id: true, email: true } });
  const rows = all.filter((r) => !isAlreadyEncrypted(r.email));
  console.log(`QuizSubmission: ${rows.length} row(s) to encrypt`);
  if (dryRun) return;

  for (const row of rows) {
    await prisma.quizSubmission.update({
      where: { id: row.id },
      data: { email: encryptFieldOrNull(row.email) },
    });
  }
}

async function main() {
  const { dryRun } = parseArgs(process.argv.slice(2));
  if (dryRun) console.log('--dry-run: counting only, no writes');

  await backfillFormSubmissions(dryRun);
  await backfillNewsletterSubscribers(dryRun);
  await backfillQuizSubmissions(dryRun);

  console.log(dryRun ? 'Dry run complete.' : 'Backfill complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
