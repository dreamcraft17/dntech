/**
 * Backfill BlogPostTranslation rows for posts that existed before the site
 * started serving /id and /en.
 *
 * Two passes:
 *   1. Locale fix — the new `blog_posts.locale` column defaults to 'id', but
 *      the automation worker used to write posts in Indonesian, English or
 *      Mandarin at random and recorded the real language as a `language:<code>`
 *      tag. This pass sets `locale` from that tag. Posts without the tag
 *      (hand-written in the admin UI) are assumed Indonesian and left alone.
 *   2. Translation — every non-deleted post gets the site locales it is
 *      missing: an 'id' post needs 'en', an 'en' post needs 'id', and a post
 *      in anything else (e.g. the old 'zh' ones) needs BOTH.
 *
 * Resumable: translations that already exist are skipped unless --force.
 *
 * Usage:
 *   npm run blog:backfill-translations
 *   npm run blog:backfill-translations -- --dry-run
 *   npm run blog:backfill-translations -- --limit=5 --locale=en
 *   npm run blog:backfill-translations -- --post=my-post-slug --force
 *
 * On the VPS dev dependencies are not installed, so run the file directly and
 * load the env file through the shell:
 *   set -a; . ./.env; set +a
 *   npx -y tsx scripts/backfill-blog-translations.ts --dry-run
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
import { translateBlogPost } from '../src/services/GeminiContentService';
import { slugify } from '../src/utils/helpers';
import {
  SITE_LOCALES,
  DEFAULT_LOCALE,
  isSiteLocale,
  uniqueTranslationSlug,
  type SiteLocale,
} from '../src/utils/blog-locale';
import { makeTranslationSlugChecker, type BlogSlugLookupClient } from '../src/services/AdminContentService';

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is not set. Run this from backend/ with the env file loaded:\n' +
      '  set -a; . ./.env; set +a'
  );
  process.exit(1);
}

const prisma = new PrismaClient();

const DEFAULT_DELAY_MS = 2_000;
const LANGUAGE_TAG_PREFIX = 'language:';

export interface BackfillOptions {
  dryRun: boolean;
  force: boolean;
  forceHuman: boolean;
  limit?: number;
  locale?: SiteLocale;
  post?: string;
  delayMs: number;
  skipLocaleFix: boolean;
  localeFixOnly: boolean;
  help: boolean;
}

const HELP = `Backfill blog post translations (id <-> en).

Flags:
  --dry-run             Report what would change; write nothing.
  --limit=N             Process at most N posts in the translation pass.
  --locale=<id|en>      Only produce translations for this target locale.
  --post=<id|slug>      Only process this one post (matched by id or slug).
  --force               Retranslate and overwrite existing MACHINE translations.
  --force-human         With --force, also overwrite human-edited translations
                        (isMachine === false). Never overwritten otherwise.
  --fix-locales         Run only the locale-fix pass (step 1) and exit.
  --skip-locale-fix     Skip the locale-fix pass and translate as-is.
  --delay=MS            Delay between AI calls (default ${DEFAULT_DELAY_MS}ms).
  --help                Show this message.

Step 1 (locale fix) runs by default before translating: it rewrites
blog_posts.locale from the automation "language:<code>" tag, because older
rows all claim to be Indonesian when roughly a third are English or Mandarin.
Posts without the tag stay 'id'. It honours --dry-run.`;

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
    post: valueOf('post'),
    delayMs: Number.isFinite(rawDelay) && rawDelay >= 0 ? rawDelay : DEFAULT_DELAY_MS,
    skipLocaleFix: argv.includes('--skip-locale-fix'),
    localeFixOnly: argv.includes('--fix-locales'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Reads the `language:<code>` tag the automation worker wrote, if present. */
export function localeFromTags(tags: unknown): string | null {
  if (!Array.isArray(tags)) return null;
  for (const tag of tags) {
    if (typeof tag === 'string' && tag.startsWith(LANGUAGE_TAG_PREFIX)) {
      const code = tag.slice(LANGUAGE_TAG_PREFIX.length).trim().toLowerCase();
      if (code) return code;
    }
  }
  return null;
}

/** Which site locales this post still needs, given the locale of its base row. */
export function missingLocalesFor(baseLocale: string, existing: string[]): SiteLocale[] {
  const have = new Set([baseLocale, ...existing]);
  return SITE_LOCALES.filter((locale) => !have.has(locale));
}

function toStringArray(tags: unknown): string[] | null {
  return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : null;
}

async function fixLocales(options: BackfillOptions) {
  const posts = await prisma.blogPost.findMany({
    where: { deletedAt: null },
    select: { id: true, title: true, slug: true, locale: true, tags: true },
    orderBy: { createdAt: 'asc' },
  });

  let corrected = 0;
  let alreadyCorrect = 0;
  let assumedDefault = 0;
  // In a dry run nothing is written, so the translation pass is handed the
  // locales this pass *would* have set — otherwise it would plan from stale
  // values and report the wrong targets.
  const resolved = new Map<string, string>();

  for (const post of posts) {
    const tagged = localeFromTags(post.tags);
    if (!tagged) {
      assumedDefault += 1;
      continue;
    }
    if (tagged === post.locale) {
      alreadyCorrect += 1;
      continue;
    }

    console.log(
      `[locale] ${options.dryRun ? 'would set' : 'set'} ${post.id} (${post.slug}) ${post.locale} -> ${tagged}`
    );
    if (!options.dryRun) {
      await prisma.blogPost.update({ where: { id: post.id }, data: { locale: tagged } });
    }
    resolved.set(post.id, tagged);
    corrected += 1;
  }

  console.log(
    `[locale] pass done: ${corrected} corrected from language tag, ${alreadyCorrect} already matched the tag, ` +
      `${assumedDefault} without a language tag left as-is (assumed '${DEFAULT_LOCALE}').`
  );

  return { corrected, alreadyCorrect, assumedDefault, total: posts.length, resolved };
}

async function translationPass(options: BackfillOptions, resolved: Map<string, string>) {
  const where: Record<string, unknown> = { deletedAt: null };
  if (options.post) {
    where.OR = [{ id: options.post }, { slug: options.post }];
  }

  const posts = await prisma.blogPost.findMany({
    where,
    include: { translations: true },
    orderBy: { createdAt: 'asc' },
  });

  if (options.post && posts.length === 0) {
    throw new Error(`No non-deleted blog post matches --post=${options.post}`);
  }

  // Build the work list first so --limit counts posts that actually need work.
  const jobs: { post: (typeof posts)[number]; baseLocale: string; targets: SiteLocale[] }[] = [];
  for (const post of posts) {
    const baseLocale = resolved.get(post.id) || post.locale || DEFAULT_LOCALE;
    const existing = post.translations.map((translation) => translation.locale);

    let targets = options.force
      ? SITE_LOCALES.filter((locale) => locale !== baseLocale)
      : missingLocalesFor(baseLocale, existing);
    if (options.locale) targets = targets.filter((locale) => locale === options.locale);

    // Never clobber an editor's work unless explicitly told to.
    targets = targets.filter((locale) => {
      const current = post.translations.find((translation) => translation.locale === locale);
      if (current && current.isMachine === false && !(options.force && options.forceHuman)) {
        console.log(
          `[skip] ${post.id} (${post.slug}) ${locale}: human-edited translation, use --force --force-human to replace`
        );
        return false;
      }
      return true;
    });

    if (targets.length > 0) jobs.push({ post, baseLocale, targets });
  }

  const selected = options.limit ? jobs.slice(0, options.limit) : jobs;
  const totalTranslations = selected.reduce((sum, job) => sum + job.targets.length, 0);

  console.log(
    `[translate] ${posts.length} posts scanned, ${jobs.length} need work, processing ${selected.length} ` +
      `(${totalTranslations} translations)${options.dryRun ? ' — dry run' : ''}.`
  );

  let created = 0;
  const failures: { postId: string; slug: string; locale: string; error: string }[] = [];

  for (const { post, baseLocale, targets } of selected) {
    for (const target of targets) {
      const label = `${post.id} (${post.slug}) ${baseLocale} -> ${target}`;

      if (options.dryRun) {
        console.log(`[dry-run] would translate ${label}`);
        continue;
      }

      try {
        const result = await translateBlogPost({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          tags: toStringArray(post.tags),
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          sourceLocale: baseLocale,
          targetLocale: target,
        });

        const slug = await uniqueTranslationSlug(
          slugify(result.slug || result.title),
          makeTranslationSlugChecker(prisma as unknown as BlogSlugLookupClient, post.id, target)
        );

        const payload = {
          title: result.title,
          slug,
          content: result.content,
          excerpt: result.excerpt ?? null,
          category: result.category ?? null,
          tags: result.tags ?? undefined,
          seoTitle: result.seoTitle ?? null,
          seoDescription: result.seoDescription ?? null,
          isMachine: true,
        };

        await prisma.blogPostTranslation.upsert({
          where: { postId_locale: { postId: post.id, locale: target } },
          create: { ...payload, postId: post.id, locale: target },
          update: payload,
        });

        created += 1;
        console.log(`[ok] ${label} -> /${slug}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push({ postId: post.id, slug: post.slug, locale: target, error: message });
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

  let resolved = new Map<string, string>();
  if (!options.skipLocaleFix) {
    resolved = (await fixLocales(options)).resolved;
  } else {
    console.log('[locale] pass skipped (--skip-locale-fix).');
  }

  if (options.localeFixOnly) {
    console.log('Locale-fix only run (--fix-locales); no translations attempted.');
    return 0;
  }

  const { created, failures, planned } = await translationPass(options, resolved);

  console.log(
    `\nDone. Translations written: ${created}/${planned}. Failed: ${failures.length}.`
  );
  if (failures.length > 0) {
    console.error('\nFailures:');
    for (const failure of failures) {
      console.error(`  - ${failure.postId} (${failure.slug}) ${failure.locale}: ${failure.error}`);
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
