import { endGlobalLoading, startGlobalLoading } from './loading-events';
import { localePath, SITE_URL } from './seo';
import { locales, type Locale } from '@/i18n/routing';

const DEFAULT_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.dntech.id/api/v1'
  : 'http://localhost:4000/api/v1';

/** Production API lives on api.dntech.id — not dntech.id/api (404). */
export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

  if (
    process.env.NODE_ENV === 'production' &&
    (/localhost(?::\d+)?/i.test(configured) || /127\.0\.0\.1(?::\d+)?/.test(configured))
  ) {
    return 'https://api.dntech.id/api/v1';
  }

  if (
    configured.includes('://dntech.id/') ||
    configured.includes('://www.dntech.id/')
  ) {
    return 'https://api.dntech.id/api/v1';
  }

  return configured;
}

const API_URL = getApiBaseUrl();

/**
 * Appends `locale` to an API endpoint so the backend serves blog/search content
 * in the language of the current route. Works with endpoints that already carry
 * a query string.
 */
export function withLocale(endpoint: string, locale: string | undefined | null): string {
  if (!locale) return endpoint;
  const [path, query = ''] = endpoint.split('?');
  const params = new URLSearchParams(query);
  params.set('locale', locale);
  return `${path}?${params.toString()}`;
}

/** Translation metadata every localized blog payload carries. */
export interface LocalizedContentMeta {
  /** The language actually served. */
  locale?: string;
  /** The language that was asked for. */
  requestedLocale?: string;
  /** True when no translation existed and the other language is shown instead. */
  isFallback?: boolean;
  isMachineTranslated?: boolean;
  availableLocales?: string[];
  /**
   * Slug per language, e.g. `{ id: 'panduan-mvp', en: 'mvp-guide' }`. Keys are
   * whatever locales exist on the post, which can include languages the site
   * has no route for — callers must filter to the site's own locales.
   */
  slugs?: Record<string, string>;
}

/**
 * Canonical + hreflang URLs for one localized content item (blog post,
 * service, ...), using each language's own slug under `basePath`.
 *
 * Languages the item does not exist in are dropped so hreflang never
 * advertises a translation that is not there, and locales outside the site's
 * routing table (older blog posts can carry e.g. `zh`) are ignored because
 * they have no URL.
 */
export function contentAlternates({
  basePath,
  locale,
  servedSlug,
  availableLocales,
  slugs,
}: {
  /** Route segment the slug lives under, e.g. '/blog' or '/services'. */
  basePath: string;
  locale: string;
  /** Slug of the language actually served — the canonical URL's slug. */
  servedSlug: string;
  availableLocales?: string[];
  slugs?: Record<string, string>;
}): { canonical: string; languages?: Record<string, string> } {
  const canonical = `${SITE_URL}${localePath(`${basePath}/${servedSlug}`, locale)}`;

  const available = (availableLocales?.length ? availableLocales : [locale]).filter(
    (candidate): candidate is Locale => (locales as readonly string[]).includes(candidate),
  );

  const languages: Record<string, string> = {};
  for (const candidate of available) {
    const slug = slugs?.[candidate] || (candidate === locale ? servedSlug : undefined);
    if (!slug) continue;
    languages[candidate] = `${SITE_URL}${localePath(`${basePath}/${slug}`, candidate)}`;
  }

  if (Object.keys(languages).length === 0) return { canonical };

  languages['x-default'] = languages.id ?? Object.values(languages)[0];
  return { canonical, languages };
}

/** @deprecated use `contentAlternates({ basePath: '/blog', ... })` */
export function blogAlternates(args: {
  locale: string;
  servedSlug: string;
  availableLocales?: string[];
  slugs?: Record<string, string>;
}): { canonical: string; languages?: Record<string, string> } {
  return contentAlternates({ basePath: '/blog', ...args });
}

/** Canonical + hreflang URLs for one service listing. */
export function serviceAlternates(args: {
  locale: string;
  servedSlug: string;
  availableLocales?: string[];
  slugs?: Record<string, string>;
}): { canonical: string; languages?: Record<string, string> } {
  return contentAlternates({ basePath: '/services', ...args });
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Auth no longer relies on localStorage: the backend issues the JWT as an
// httpOnly cookie on login, which the browser attaches automatically to
// same-site requests made with credentials: 'include'. There is nothing for
// client JS to read or attach as an Authorization header any more.

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  startGlobalLoading();
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers, credentials: 'include' });
    const json: ApiResponse<T> = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Permintaan gagal');
    }

    return json.data;
  } finally {
    endGlobalLoading();
  }
}

export async function apiUpload<T>(endpoint: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  startGlobalLoading();
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const json: ApiResponse<T> = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Upload gagal');
    }

    return json.data;
  } finally {
    endGlobalLoading();
  }
}

export async function apiFetchPaginated<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T; pagination: ApiResponse<T>['pagination'] }> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  startGlobalLoading();
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers, credentials: 'include' });
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Permintaan gagal');
    }

    return { data: json.data, pagination: json.pagination };
  } finally {
    endGlobalLoading();
  }
}

export function getApiUrl(path: string) {
  return `${API_URL}${path}`;
}

export function getUploadUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Coerce API / JSON null to a safe array for .map() during SSR. */
export function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export async function trackPageView(pageUrl: string, pageTitle?: string, leadSource?: string) {
  try {
    const sessionId = typeof window !== 'undefined'
      ? sessionStorage.getItem('sessionId') || crypto.randomUUID()
      : '';
    if (typeof window !== 'undefined' && sessionId) {
      sessionStorage.setItem('sessionId', sessionId);
    }
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    let source = leadSource;
    if (!source && referrer) {
      try {
        const host = new URL(referrer).hostname;
        if (host.includes('google') || host.includes('bing')) source = 'organic';
        else if (host.includes('facebook') || host.includes('linkedin')) source = 'referral';
        else source = 'referral';
      } catch {
        source = 'direct';
      }
    }
    if (!source) source = 'direct';

    await fetch(`${API_URL}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'page_view',
        pageUrl,
        pageTitle,
        sessionId,
        referrer,
        leadSource: source,
      }),
    });
  } catch {
    // silent fail
  }
}
