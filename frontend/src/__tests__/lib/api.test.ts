import { asArray, apiFetch, apiUpload, apiFetchPaginated, trackPageView } from '@/lib/api';
import { startGlobalLoading, endGlobalLoading } from '@/lib/loading-events';

jest.mock('@/lib/loading-events');

const mockedStart = startGlobalLoading as jest.Mock;
const mockedEnd = endGlobalLoading as jest.Mock;

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('asArray', () => {
  it('returns safe array from nullish values', () => {
    expect(asArray(null)).toEqual([]);
    expect(asArray(undefined)).toEqual([]);
    expect(asArray([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('returns an empty array for a fresh array literal', () => {
    expect(asArray([])).toEqual([]);
  });
});

describe('apiFetch', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    mockedStart.mockClear();
    mockedEnd.mockClear();
    localStorage.clear();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('returns data on a successful response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ success: true, data: { id: 1, name: 'test' } })
    );

    const result = await apiFetch<{ id: number; name: string }>('/things/1');

    expect(result).toEqual({ id: 1, name: 'test' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/things/1'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
    expect(mockedStart).toHaveBeenCalledTimes(1);
    expect(mockedEnd).toHaveBeenCalledTimes(1);
  });

  it('throws using the server error message when res.ok is false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse(
        { success: false, error: { code: 'NOT_FOUND', message: 'Data tidak ditemukan' } },
        false
      )
    );

    await expect(apiFetch('/things/999')).rejects.toThrow('Data tidak ditemukan');
    expect(mockedStart).toHaveBeenCalledTimes(1);
    expect(mockedEnd).toHaveBeenCalledTimes(1);
  });

  it('throws the fallback message when success is false but no error message is provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse({ success: false }, true));

    await expect(apiFetch('/things')).rejects.toThrow('Permintaan gagal');
  });

  it('propagates a network failure and still ends global loading via finally', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

    await expect(apiFetch('/things')).rejects.toThrow('network down');
    expect(mockedStart).toHaveBeenCalledTimes(1);
    expect(mockedEnd).toHaveBeenCalledTimes(1);
  });

  it('sends credentials: include so the httpOnly auth cookie is attached', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse({ success: true, data: {} }));

    await apiFetch('/protected');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.credentials).toBe('include');
    expect(options.headers.Authorization).toBeUndefined();
  });
});

describe('apiUpload', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    mockedStart.mockClear();
    mockedEnd.mockClear();
    localStorage.clear();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  const file = new File(['content'], 'test.png', { type: 'image/png' });

  it('returns data on a successful upload', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ success: true, data: { url: 'https://cdn.example.com/test.png' } })
    );

    const result = await apiUpload<{ url: string }>('/uploads', file);

    expect(result).toEqual({ url: 'https://cdn.example.com/test.png' });
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.body).toBeInstanceOf(FormData);
    expect(mockedStart).toHaveBeenCalledTimes(1);
    expect(mockedEnd).toHaveBeenCalledTimes(1);
  });

  it('throws the fallback "Upload gagal" message when no error message is provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse({ success: false }, false));

    await expect(apiUpload('/uploads', file)).rejects.toThrow('Upload gagal');
    expect(mockedEnd).toHaveBeenCalledTimes(1);
  });

  it('throws the server error message when provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ success: false, error: { code: 'TOO_LARGE', message: 'File terlalu besar' } }, false)
    );

    await expect(apiUpload('/uploads', file)).rejects.toThrow('File terlalu besar');
  });

  it('sends credentials: include so the httpOnly auth cookie is attached', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse({ success: true, data: {} }));

    await apiUpload('/uploads', file);

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(options.credentials).toBe('include');
    expect(options.headers).toBeUndefined();
  });
});

describe('apiFetchPaginated', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    mockedStart.mockClear();
    mockedEnd.mockClear();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('returns both data and pagination on success', async () => {
    const pagination = { page: 1, pageSize: 20, total: 42, pages: 3 };
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ success: true, data: [{ id: 1 }, { id: 2 }], pagination })
    );

    const result = await apiFetchPaginated<{ id: number }[]>('/things');

    expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.pagination).toEqual(pagination);
    expect(mockedEnd).toHaveBeenCalledTimes(1);
  });

  it('throws when the response is not successful', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({ success: false, error: { code: 'ERR', message: 'Gagal memuat data' } }, false)
    );

    await expect(apiFetchPaginated('/things')).rejects.toThrow('Gagal memuat data');
    expect(mockedEnd).toHaveBeenCalledTimes(1);
  });
});

describe('getApiBaseUrl / getApiUrl / getUploadUrl (env-dependent)', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
  });

  function loadApi() {
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@/lib/api') as typeof import('@/lib/api');
  }

  it('falls back to the localhost default outside production', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_API_URL;

    const { getApiBaseUrl } = loadApi();

    expect(getApiBaseUrl()).toBe('http://localhost:4000/api/v1');
  });

  it('falls back to the production default when unconfigured', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_API_URL;

    const { getApiBaseUrl } = loadApi();

    expect(getApiBaseUrl()).toBe('https://api.dntech.id/api/v1');
  });

  it('overrides a localhost configuration in production', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000/api/v1';

    const { getApiBaseUrl } = loadApi();

    expect(getApiBaseUrl()).toBe('https://api.dntech.id/api/v1');
  });

  it('overrides a 127.0.0.1 configuration in production', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_API_URL = 'http://127.0.0.1:5000/api/v1';

    const { getApiBaseUrl } = loadApi();

    expect(getApiBaseUrl()).toBe('https://api.dntech.id/api/v1');
  });

  it('overrides the marketing domain (dntech.id, not the api subdomain) in production', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_API_URL = 'https://dntech.id/api/v1';

    const { getApiBaseUrl } = loadApi();

    expect(getApiBaseUrl()).toBe('https://api.dntech.id/api/v1');
  });

  it('overrides the www marketing domain in production', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_API_URL = 'https://www.dntech.id/api/v1';

    const { getApiBaseUrl } = loadApi();

    expect(getApiBaseUrl()).toBe('https://api.dntech.id/api/v1');
  });

  it('respects a valid configured URL in production', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_API_URL = 'https://api.dntech.id/api/v1';

    const { getApiBaseUrl } = loadApi();

    expect(getApiBaseUrl()).toBe('https://api.dntech.id/api/v1');
  });

  it('respects a different, valid custom domain in production', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_API_URL = 'https://staging-api.dntech.id/api/v1';

    const { getApiBaseUrl } = loadApi();

    expect(getApiBaseUrl()).toBe('https://staging-api.dntech.id/api/v1');
  });

  it('getApiUrl builds a URL against the resolved base (baked in at module load)', () => {
    (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_API_URL;

    const { getApiUrl } = loadApi();

    expect(getApiUrl('/posts/1')).toBe('http://localhost:4000/api/v1/posts/1');
  });

  it('getUploadUrl defaults to localhost:4000 when NEXT_PUBLIC_API_URL is unset', () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    const { getUploadUrl } = loadApi();

    expect(getUploadUrl('/uploads/1.png')).toBe('http://localhost:4000/uploads/1.png');
  });

  it('getUploadUrl strips the /api/v1 suffix off a configured URL', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.dntech.id/api/v1';

    const { getUploadUrl } = loadApi();

    expect(getUploadUrl('/uploads/1.png')).toBe('https://api.dntech.id/uploads/1.png');
  });
});

describe('trackPageView', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ success: true }));
    sessionStorage.clear();
    sessionStorage.setItem('sessionId', 'fixed-session-id');
    Object.defineProperty(document, 'referrer', { value: '', configurable: true });
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('posts the expected body shape on success', async () => {
    await trackPageView('/blog/hello', 'Hello Post');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/analytics/track'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body).toMatchObject({
      eventType: 'page_view',
      pageUrl: '/blog/hello',
      pageTitle: 'Hello Post',
      sessionId: 'fixed-session-id',
      leadSource: 'direct',
    });
  });

  it('swallows a fetch failure and never throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

    await expect(trackPageView('/blog/hello')).resolves.toBeUndefined();
  });

  it('infers "organic" leadSource from a google referrer', async () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://www.google.com/search?q=dntech',
      configurable: true,
    });

    await trackPageView('/pricing');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.leadSource).toBe('organic');
  });

  it('infers "referral" leadSource from a facebook referrer', async () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://www.facebook.com/',
      configurable: true,
    });

    await trackPageView('/pricing');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.leadSource).toBe('referral');
  });

  it('infers "direct" leadSource when there is no referrer', async () => {
    Object.defineProperty(document, 'referrer', { value: '', configurable: true });

    await trackPageView('/pricing');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.leadSource).toBe('direct');
  });

  it('respects an explicit leadSource parameter over inference', async () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://www.google.com/search?q=dntech',
      configurable: true,
    });

    await trackPageView('/pricing', undefined, 'paid-ads');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.leadSource).toBe('paid-ads');
  });

  // Note: trackPageView is only ever invoked from client components (page-view
  // tracking hooks), so it always runs with `window`/`document`/`sessionStorage`
  // available in practice; it is not exercised here in an SSR context.
});
