import { defineRouting } from 'next-intl/routing';

export const locales = ['id', 'en'] as const;
export type Locale = (typeof locales)[number];

export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const localeLabels: Record<Locale, { native: string; short: string }> = {
  id: { native: 'Bahasa Indonesia', short: 'ID' },
  en: { native: 'English', short: 'EN' },
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'id',
  localePrefix: 'always',
  // Locale for an unprefixed URL is resolved in middleware.ts from the manual
  // cookie choice first, then the edge geo header — not from Accept-Language alone.
  localeDetection: false,
});
