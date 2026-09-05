import { endGlobalLoading, startGlobalLoading } from './loading-events';

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
  const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';
  return `${base}${path}`;
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
