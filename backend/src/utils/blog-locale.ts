/**
 * Blog posts are stored as one base row (BlogPost, written in BlogPost.locale)
 * plus zero or more BlogPostTranslation rows. The public site asks for a locale
 * and always gets something back: the matching version when it exists, the base
 * row otherwise.
 */

export const SITE_LOCALES = ['id', 'en'] as const;
export type SiteLocale = (typeof SITE_LOCALES)[number];
export const DEFAULT_LOCALE: SiteLocale = 'id';

export function isSiteLocale(value: unknown): value is SiteLocale {
  return typeof value === 'string' && SITE_LOCALES.includes(value as SiteLocale);
}

/** Reads a locale from a query param, falling back to Accept-Language, then 'id'. */
export function normalizeLocale(value: unknown, acceptLanguage?: string | null): SiteLocale {
  if (isSiteLocale(value)) return value;

  const header = acceptLanguage?.toLowerCase() ?? '';
  for (const part of header.split(',')) {
    const tag = part.trim().split(';')[0];
    if (tag.startsWith('id') || tag.startsWith('in')) return 'id';
    if (tag.startsWith('en')) return 'en';
  }

  return DEFAULT_LOCALE;
}

interface TranslationRow {
  locale: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  category?: string | null;
  tags?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isMachine?: boolean;
}

interface BasePost {
  locale?: string | null;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  category?: string | null;
  tags?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
  translations?: TranslationRow[] | null;
  [key: string]: unknown;
}

export interface ResolvedBlogPost {
  [key: string]: unknown;
  locale: SiteLocale | string;
  requestedLocale: SiteLocale;
  isMachineTranslated: boolean;
  isFallback: boolean;
  availableLocales: string[];
  /** Slug per locale, so the site can point hreflang at each language's own URL. */
  slugs: Record<string, string>;
}

/**
 * Merges the requested locale's fields over the base row. `translations` is
 * dropped from the result so the public payload keeps its existing shape.
 */
export function resolveBlogPost<T extends BasePost>(
  post: T,
  requestedLocale: SiteLocale
): ResolvedBlogPost {
  const { translations, ...base } = post;
  const baseLocale = post.locale || DEFAULT_LOCALE;
  const rows = translations ?? [];
  const availableLocales = [...new Set([baseLocale, ...rows.map((row) => row.locale)])];
  const slugs: Record<string, string> = { [baseLocale]: post.slug };
  for (const row of rows) slugs[row.locale] = row.slug;

  if (baseLocale === requestedLocale) {
    return {
      ...base,
      locale: baseLocale,
      requestedLocale,
      isMachineTranslated: false,
      isFallback: false,
      availableLocales,
      slugs,
    };
  }

  const match = rows.find((row) => row.locale === requestedLocale);
  if (!match) {
    return {
      ...base,
      locale: baseLocale,
      requestedLocale,
      isMachineTranslated: false,
      isFallback: true,
      availableLocales,
      slugs,
    };
  }

  return {
    ...base,
    title: match.title,
    slug: match.slug,
    content: match.content,
    excerpt: match.excerpt ?? base.excerpt ?? null,
    category: match.category ?? base.category ?? null,
    tags: match.tags ?? base.tags ?? null,
    seoTitle: match.seoTitle ?? base.seoTitle ?? null,
    seoDescription: match.seoDescription ?? base.seoDescription ?? null,
    locale: requestedLocale,
    requestedLocale,
    isMachineTranslated: match.isMachine !== false,
    isFallback: false,
    availableLocales,
    slugs,
  };
}

/**
 * A translated post gets its own slug, so it has to be unique against both the
 * base rows and the other translations. Callers pass a lookup so this stays
 * usable from scripts, services and tests alike.
 */
export async function uniqueTranslationSlug(
  desired: string,
  isTaken: (candidate: string) => Promise<boolean>
): Promise<string> {
  const base = desired || 'post';
  let candidate = base;
  let suffix = 2;

  while (await isTaken(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
