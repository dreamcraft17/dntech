/**
 * Services are stored as one base row (Service, written in Service.locale) plus
 * zero or more ServiceTranslation rows. The public site asks for a locale and
 * always gets something back: the matching version when it exists, the base
 * row otherwise.
 *
 * This mirrors src/utils/blog-locale.ts — kept separate because the two
 * content types resolve a different field set, but sharing the locale
 * primitives (SITE_LOCALES, normalizeLocale, uniqueTranslationSlug) so both
 * stay in lockstep.
 */
export {
  SITE_LOCALES,
  DEFAULT_LOCALE,
  isSiteLocale,
  normalizeLocale,
  uniqueTranslationSlug,
  type SiteLocale,
} from './blog-locale';

import { DEFAULT_LOCALE, type SiteLocale } from './blog-locale';

interface ServiceTranslationRow {
  locale: string;
  name: string;
  slug: string;
  description: string;
  features?: unknown;
  category?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isMachine?: boolean;
}

interface BaseService {
  locale?: string | null;
  name: string;
  slug: string;
  description: string;
  features?: unknown;
  category?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  translations?: ServiceTranslationRow[] | null;
  [key: string]: unknown;
}

export interface ResolvedService {
  [key: string]: unknown;
  locale: SiteLocale | string;
  requestedLocale: SiteLocale;
  isMachineTranslated: boolean;
  isFallback: boolean;
  availableLocales: string[];
  slugs: Record<string, string>;
}

export function resolveServiceRecord<T extends BaseService>(
  service: T,
  requestedLocale: SiteLocale
): ResolvedService {
  const { translations, ...base } = service;
  const baseLocale = service.locale || DEFAULT_LOCALE;
  const rows = translations ?? [];
  const availableLocales = [...new Set([baseLocale, ...rows.map((row) => row.locale)])];
  const slugs: Record<string, string> = { [baseLocale]: service.slug };
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
    name: match.name,
    slug: match.slug,
    description: match.description,
    features: match.features ?? base.features ?? null,
    category: match.category ?? base.category ?? null,
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
