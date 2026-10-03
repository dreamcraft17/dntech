import type { MetadataRoute } from 'next';
import { fetchPublicApiList } from '@/lib/server-api';
import { SITE_URL, localePath } from '@/lib/seo';
import { locales } from '@/i18n/routing';

// Without this, Next.js generates sitemap.xml once at build time and never
// again — new blog posts/services/products/case studies published after
// deploy silently never show up until the next redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '', '/services', '/products', '/case-studies', '/portfolio', '/about', '/blog', '/contact',
    '/faq', '/careers', '/team', '/testimonials', '/terms', '/privacy', '/quiz', '/resources',
  ];

  const alternatesFor = (path: string) => ({
    languages: Object.fromEntries(
      locales.map((locale) => [locale, `${SITE_URL}${localePath(path || '/', locale)}`])
    ),
  });

  const forEachLocale = <T,>(build: (locale: string) => T) => locales.map(build);

  const staticEntries = staticPages.flatMap((path) =>
    forEachLocale((locale) => ({
      url: `${SITE_URL}${localePath(path || '/', locale)}`,
      alternates: alternatesFor(path),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    }))
  );

  const [services, products, blog, caseStudies] = await Promise.all([
    fetchPublicApiList<{ slug: string; updatedAt?: string }>('/services', 3600),
    fetchPublicApiList<{ slug: string; updatedAt?: string }>('/products', 3600),
    fetchPublicApiList<{ slug: string; publishedAt?: string }>('/blog?pageSize=100', 3600),
    fetchPublicApiList<{ slug: string; publishedAt?: string }>('/case-studies?pageSize=100', 3600),
  ]);

  return [
    ...staticEntries,
    ...services.filter((s) => s.slug?.trim()).flatMap((s) =>
      forEachLocale((locale) => ({
        url: `${SITE_URL}${localePath(`/services/${s.slug}`, locale)}`,
        alternates: alternatesFor(`/services/${s.slug}`),
        ...(s.updatedAt ? { lastModified: new Date(s.updatedAt) } : {}),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    ),
    ...products.filter((p) => p.slug?.trim()).flatMap((p) =>
      forEachLocale((locale) => ({
        url: `${SITE_URL}${localePath(`/products/${p.slug}`, locale)}`,
        alternates: alternatesFor(`/products/${p.slug}`),
        ...(p.updatedAt ? { lastModified: new Date(p.updatedAt) } : {}),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    ),
    ...blog.filter((b) => b.slug?.trim()).flatMap((b) =>
      forEachLocale((locale) => ({
        url: `${SITE_URL}${localePath(`/blog/${b.slug}`, locale)}`,
        alternates: alternatesFor(`/blog/${b.slug}`),
        ...(b.publishedAt ? { lastModified: new Date(b.publishedAt) } : {}),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    ),
    ...caseStudies.filter((p) => p.slug?.trim()).flatMap((p) =>
      forEachLocale((locale) => ({
        url: `${SITE_URL}${localePath(`/case-studies/${p.slug}`, locale)}`,
        alternates: alternatesFor(`/case-studies/${p.slug}`),
        ...(p.publishedAt ? { lastModified: new Date(p.publishedAt) } : {}),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    ),
  ];
}
