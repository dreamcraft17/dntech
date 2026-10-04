import { blogAlternates, serviceAlternates, withLocale } from '@/lib/api';
import { SITE_URL } from '@/lib/seo';

describe('withLocale', () => {
  it('adds the locale to an endpoint without a query string', () => {
    expect(withLocale('/blog/categories', 'en')).toBe('/blog/categories?locale=en');
  });

  it('keeps existing query params', () => {
    const result = withLocale('/blog?page=2&pageSize=9', 'id');
    const params = new URLSearchParams(result.split('?')[1]);
    expect(result.startsWith('/blog?')).toBe(true);
    expect(params.get('page')).toBe('2');
    expect(params.get('pageSize')).toBe('9');
    expect(params.get('locale')).toBe('id');
  });

  it('overrides a locale that is already present', () => {
    expect(withLocale('/search?q=hr&locale=id', 'en')).toBe('/search?q=hr&locale=en');
  });

  it('preserves encoded values', () => {
    expect(withLocale('/search?q=hr%20software', 'en')).toBe('/search?q=hr+software&locale=en');
  });

  it('returns the endpoint untouched when no locale is given', () => {
    expect(withLocale('/blog', undefined)).toBe('/blog');
    expect(withLocale('/blog', '')).toBe('/blog');
  });
});

describe('blogAlternates', () => {
  it('points each hreflang alternate at that language own slug', () => {
    const { canonical, languages } = blogAlternates({
      locale: 'en',
      servedSlug: 'mvp-guide',
      availableLocales: ['id', 'en'],
      slugs: { id: 'panduan-mvp', en: 'mvp-guide' },
    });

    expect(canonical).toBe(`${SITE_URL}/en/blog/mvp-guide`);
    expect(languages).toEqual({
      id: `${SITE_URL}/id/blog/panduan-mvp`,
      en: `${SITE_URL}/en/blog/mvp-guide`,
      'x-default': `${SITE_URL}/id/blog/panduan-mvp`,
    });
    expect(languages?.id).not.toBe(languages?.en);
  });

  it('drops languages the post does not exist in', () => {
    const { canonical, languages } = blogAlternates({
      locale: 'en',
      servedSlug: 'panduan-mvp',
      availableLocales: ['id'],
      slugs: { id: 'panduan-mvp' },
    });

    // Served as a fallback, so the canonical keeps the requested locale prefix.
    expect(canonical).toBe(`${SITE_URL}/en/blog/panduan-mvp`);
    expect(languages).toEqual({
      id: `${SITE_URL}/id/blog/panduan-mvp`,
      'x-default': `${SITE_URL}/id/blog/panduan-mvp`,
    });
  });

  it('ignores locales the site has no route for', () => {
    const { languages } = blogAlternates({
      locale: 'id',
      servedSlug: 'panduan-mvp',
      availableLocales: ['id', 'en', 'zh'],
      slugs: { id: 'panduan-mvp', en: 'mvp-guide', zh: 'mvp-zhinan' },
    });

    expect(Object.keys(languages ?? {}).sort()).toEqual(['en', 'id', 'x-default']);
  });

  it('falls back to the served slug when the payload carries no slug map', () => {
    const { canonical, languages } = blogAlternates({
      locale: 'id',
      servedSlug: 'panduan-mvp',
    });

    expect(canonical).toBe(`${SITE_URL}/id/blog/panduan-mvp`);
    expect(languages).toEqual({
      id: `${SITE_URL}/id/blog/panduan-mvp`,
      'x-default': `${SITE_URL}/id/blog/panduan-mvp`,
    });
  });
});

describe('serviceAlternates', () => {
  it('points each hreflang alternate at that language own slug under /services', () => {
    const { canonical, languages } = serviceAlternates({
      locale: 'en',
      servedSlug: 'custom-application-development',
      availableLocales: ['id', 'en'],
      slugs: { id: 'pengembangan-aplikasi-custom', en: 'custom-application-development' },
    });

    expect(canonical).toBe(`${SITE_URL}/en/services/custom-application-development`);
    expect(languages).toEqual({
      id: `${SITE_URL}/id/services/pengembangan-aplikasi-custom`,
      en: `${SITE_URL}/en/services/custom-application-development`,
      'x-default': `${SITE_URL}/id/services/pengembangan-aplikasi-custom`,
    });
  });

  it('drops languages the service does not exist in', () => {
    const { languages } = serviceAlternates({
      locale: 'en',
      servedSlug: 'pengembangan-aplikasi-custom',
      availableLocales: ['id'],
      slugs: { id: 'pengembangan-aplikasi-custom' },
    });

    expect(languages).toEqual({
      id: `${SITE_URL}/id/services/pengembangan-aplikasi-custom`,
      'x-default': `${SITE_URL}/id/services/pengembangan-aplikasi-custom`,
    });
  });
});
