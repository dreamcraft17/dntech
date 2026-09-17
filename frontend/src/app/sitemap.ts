import type { MetadataRoute } from 'next';
import { fetchPublicApiList } from '@/lib/server-api';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '', '/services', '/products', '/case-studies', '/portfolio', '/about', '/blog', '/contact',
    '/faq', '/careers', '/team', '/testimonials', '/terms', '/privacy', '/quiz', '/resources',
  ];

  const staticEntries = staticPages.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const [services, products, blog, caseStudies] = await Promise.all([
    fetchPublicApiList<{ slug: string; updatedAt?: string }>('/services', 3600),
    fetchPublicApiList<{ slug: string; updatedAt?: string }>('/products', 3600),
    fetchPublicApiList<{ slug: string; publishedAt?: string }>('/blog?pageSize=100', 3600),
    fetchPublicApiList<{ slug: string; publishedAt?: string }>('/case-studies?pageSize=100', 3600),
  ]);

  return [
    ...staticEntries,
    ...services.filter((s) => s.slug?.trim()).map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      ...(s.updatedAt ? { lastModified: new Date(s.updatedAt) } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...products.filter((p) => p.slug?.trim()).map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      ...(p.updatedAt ? { lastModified: new Date(p.updatedAt) } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...blog.filter((b) => b.slug?.trim()).map((b) => ({
      url: `${SITE_URL}/blog/${b.slug}`,
      ...(b.publishedAt ? { lastModified: new Date(b.publishedAt) } : {}),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...caseStudies.filter((p) => p.slug?.trim()).map((p) => ({
      url: `${SITE_URL}/case-studies/${p.slug}`,
      ...(p.publishedAt ? { lastModified: new Date(p.publishedAt) } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
