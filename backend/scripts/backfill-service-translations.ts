/**
 * Backfill ServiceTranslation rows for services that existed before the site
 * started serving /id and /en.
 *
 * Unlike blog posts, every service was written by an admin through the CMS,
 * so Service.locale is reliably 'id' already — there is no language-tag pass
 * to run first. Every non-deleted service just needs its missing locale
 * (always 'en', since the base is always 'id' today).
 *
 * Resumable: translations that already exist are skipped unless --force.
 *
 * Usage:
 *   npm run services:backfill-translations
 *   npm run services:backfill-translations -- --dry-run
 *   npm run services:backfill-translations -- --limit=5 --locale=en
 *   npm run services:backfill-translations -- --service=my-service-slug --force
 *
 * On the VPS dev dependencies are not installed, so run the file directly and
 * load the env file through the shell:
 *   set -a; . ./.env; set +a
 *   npx -y tsx scripts/backfill-service-translations.ts --dry-run
 */
// Loaded through require so the script still runs where dotenv cannot be
// resolved — on the VPS it is launched via `npx tsx`, which resolves from npm's
// cache directory rather than from backend/node_modules. Without dotenv the
// process simply uses the environment it was given.
try {
  require('dotenv/config');
} catch {
  // Intentionally empty: env vars are expected to come from the shell instead.
}

import { PrismaClient } from '@prisma/client';
import { translateService } from '../src/services/GeminiContentService';
import { slugify } from '../src/utils/helpers';
import {
  SITE_LOCALES,
  DEFAULT_LOCALE,
  isSiteLocale,
  uniqueTranslationSlug,
  type SiteLocale,
} from '../src/utils/blog-locale';
import { makeServiceTranslationSlugChecker, type ServiceSlugLookupClient } from '../src/services/AdminContentService';

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is not set. Run this from backend/ with the env file loaded:\n' +
      '  set -a; . ./.env; set +a'
  );
  process.exit(1);
}

const prisma = new PrismaClient();

const DEFAULT_DELAY_MS = 2_000;

export interface BackfillOptions {
  dryRun: boolean;
  force: boolean;
  forceHuman: boolean;
  limit?: number;
  locale?: SiteLocale;
  service?: string;
  delayMs: number;
  help: boolean;
}

const HELP = `Backfill service listing translations (id <-> en).

Flags:
  --dry-run              Report what would change; write nothing.
  --limit=N               Process at most N services.
  --locale=<id|en>        Only produce translations for this target locale.
  --service=<id|slug>     Only process this one service (matched by id or slug).
  --force                 Retranslate and overwrite existing MACHINE translations.
  --force-human           With --force, also overwrite human-edited translations
                          (isMachine === false). Never overwritten otherwise.
  --delay=MS              Delay between AI calls (default ${DEFAULT_DELAY_MS}ms).
  --help                  Show this message.

Every service is authored in Indonesian through the admin UI, so this script
only ever fills in the locales a service is missing — there is no locale-fix
pass like the blog backfill has.`;

export function parseArgs(argv: string[]): BackfillOptions {
  const valueOf = (name: string): string | undefined => {
    const inline = argv.find((arg) => arg.startsWith(`--${name}=`));
    if (inline) return inline.slice(name.length + 3);
    const index = argv.indexOf(`--${name}`);
    const next = index >= 0 ? argv[index + 1] : undefined;
    return next && !next.startsWith('--') ? next : undefined;
  };

  const rawLimit = Number(valueOf('limit'));
  const rawDelay = Number(valueOf('delay'));
  const rawLocale = valueOf('locale');

  if (rawLocale !== undefined && !isSiteLocale(rawLocale)) {
    throw new Error(`--locale must be one of ${SITE_LOCALES.join(', ')} (got "${rawLocale}")`);
  }

  return {
    dryRun: argv.includes('--dry-run'),
    force: argv.includes('--force'),
    forceHuman: argv.includes('--force-human'),
    limit: Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : undefined,
    locale: rawLocale as SiteLocale | undefined,
    service: valueOf('service'),
    delayMs: Number.isFinite(rawDelay) && rawDelay >= 0 ? rawDelay : DEFAULT_DELAY_MS,
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Which site locales this service still needs, given the locale of its base row. */
export function missingLocalesFor(baseLocale: string, existing: string[]): SiteLocale[] {
  const have = new Set([baseLocale, ...existing]);
  return SITE_LOCALES.filter((locale) => !have.has(locale));
}

function toFeatureArray(features: unknown): Array<{ title: string; description?: string }> | null {
  return Array.isArray(features)
    ? (features as Array<{ title: string; description?: string }>)
    : null;
}

async function translationPass(options: BackfillOptions) {
  const where: Record<string, unknown> = { deletedAt: null };
  if (options.service) {
    where.OR = [{ id: options.service }, { slug: options.service }];
  }

  const services = await prisma.service.findMany({
    where,
    include: { translations: true },
    orderBy: { createdAt: 'asc' },
  });

  if (options.service && services.length === 0) {
    throw new Error(`No non-deleted service matches --service=${options.service}`);
  }

  // Build the work list first so --limit counts services that actually need work.
  const jobs: { service: (typeof services)[number]; baseLocale: string; targets: SiteLocale[] }[] = [];
  for (const service of services) {
    const baseLocale = service.locale || DEFAULT_LOCALE;
    const existing = service.translations.map((translation) => translation.locale);

    let targets = options.force
      ? SITE_LOCALES.filter((locale) => locale !== baseLocale)
      : missingLocalesFor(baseLocale, existing);
    if (options.locale) targets = targets.filter((locale) => locale === options.locale);

    // Never clobber an editor's work unless explicitly told to.
    targets = targets.filter((locale) => {
      const current = service.translations.find((translation) => translation.locale === locale);
      if (current && current.isMachine === false && !(options.force && options.forceHuman)) {
        console.log(
          `[skip] ${service.id} (${service.slug}) ${locale}: human-edited translation, use --force --force-human to replace`
        );
        return false;
      }
      return true;
    });

    if (targets.length > 0) jobs.push({ service, baseLocale, targets });
  }

  const selected = options.limit ? jobs.slice(0, options.limit) : jobs;
  const totalTranslations = selected.reduce((sum, job) => sum + job.targets.length, 0);

  console.log(
    `[translate] ${services.length} services scanned, ${jobs.length} need work, processing ${selected.length} ` +
      `(${totalTranslations} translations)${options.dryRun ? ' — dry run' : ''}.`
  );

  let created = 0;
  const failures: { serviceId: string; slug: string; locale: string; error: string }[] = [];

  for (const { service, baseLocale, targets } of selected) {
    for (const target of targets) {
      const label = `${service.id} (${service.slug}) ${baseLocale} -> ${target}`;

      if (options.dryRun) {
        console.log(`[dry-run] would translate ${label}`);
        continue;
      }

      try {
        const result = await translateService({
          name: service.name,
          description: service.description,
          features: toFeatureArray(service.features),
          category: service.category,
          seoTitle: service.seoTitle,
          seoDescription: service.seoDescription,
          sourceLocale: baseLocale,
          targetLocale: target,
        });

        const slug = await uniqueTranslationSlug(
          slugify(result.slug || result.name),
          makeServiceTranslationSlugChecker(prisma as unknown as ServiceSlugLookupClient, service.id, target)
        );

        const payload = {
          name: result.name,
          slug,
          description: result.description,
          features: result.features ?? undefined,
          category: result.category ?? null,
          seoTitle: result.seoTitle ?? null,
          seoDescription: result.seoDescription ?? null,
          isMachine: true,
        };

        await prisma.serviceTranslation.upsert({
          where: { serviceId_locale: { serviceId: service.id, locale: target } },
          create: { ...payload, serviceId: service.id, locale: target },
          update: payload,
        });

        created += 1;
        console.log(`[ok] ${label} -> /${slug}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push({ serviceId: service.id, slug: service.slug, locale: target, error: message });
        console.error(`[fail] ${label}: ${message}`);
      }

      // Sequential with a small pause so the provider is not hammered.
      await sleep(options.delayMs);
    }
  }

  return { created, failures, planned: totalTranslations };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(HELP);
    return 0;
  }

  if (options.forceHuman && !options.force) {
    console.warn('[warn] --force-human has no effect without --force.');
  }

  const { created, failures, planned } = await translationPass(options);

  console.log(`\nDone. Translations written: ${created}/${planned}. Failed: ${failures.length}.`);
  if (failures.length > 0) {
    console.error('\nFailures:');
    for (const failure of failures) {
      console.error(`  - ${failure.serviceId} (${failure.slug}) ${failure.locale}: ${failure.error}`);
    }
    return 1;
  }

  return 0;
}

// Only run when executed directly, so the helpers above stay unit-testable.
if (require.main === module) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
