import type { NextRequest } from 'next/server';
import { LOCALE_COOKIE, locales, routing, type Locale } from './routing';

// Country headers injected by the edge in front of the app. dntech.id is served
// through Cloudflare (cf-ipcountry); the Vercel/Netlify names are kept so a
// preview deploy on either platform still detects correctly.
const GEO_HEADERS = [
  'cf-ipcountry',
  'x-vercel-ip-country',
  'x-nf-geo-country',
  'x-geo-country',
] as const;

function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

function localeFromCountry(country: string | null): Locale | null {
  if (!country) return null;
  const normalized = country.trim().toUpperCase();
  // XX/T1 are Cloudflare's "unknown"/Tor placeholders, not real countries.
  if (!normalized || normalized === 'XX' || normalized === 'T1') return null;
  return normalized === 'ID' ? 'id' : 'en';
}

function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const preferred = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.split('=')[1]) || 0 : 1 };
    })
    .filter((entry) => entry.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of preferred) {
    if (tag.startsWith('id') || tag.startsWith('in')) return 'id';
    if (tag.startsWith('en')) return 'en';
  }
  return null;
}

/**
 * Resolution order: an explicit choice the visitor made (cookie) always wins over
 * geo, so switching language in the navbar sticks on later visits.
 */
export function detectLocale(request: NextRequest): Locale {
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  for (const header of GEO_HEADERS) {
    const locale = localeFromCountry(request.headers.get(header));
    if (locale) return locale;
  }

  return localeFromAcceptLanguage(request.headers.get('accept-language')) ?? routing.defaultLocale;
}
