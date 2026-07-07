const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Request failed');
  }

  return json.data;
}

export async function apiFetchPaginated<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T; pagination: ApiResponse<T>['pagination'] }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Request failed');
  }

  return { data: json.data, pagination: json.pagination };
}

export function getApiUrl(path: string) {
  return `${API_URL}${path}`;
}

export function getUploadUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';
  return `${base}${path}`;
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
