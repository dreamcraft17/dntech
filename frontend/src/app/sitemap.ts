import type { MetadataRoute } from 'next';
import { fetchPublicApiList } from '@/lib/server-api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '', '/services', '/products', '/case-studies', '/portfolio', '/about', '/blog', '/contact',
    '/faq', '/careers', '/team', '/testimonials', '/terms', '/privacy', '/quiz', '/resources',
  ];

  const staticEntries = staticPages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const [services, products, blog, caseStudies] = await Promise.all([
    fetchPublicApiList<{ slug: string; updatedAt?: string }>('/services', 3600),
    fetchPublicApiList<{ slug: string; updatedAt?: string }>('/products', 3600),
    fetchPublicApiList<{ slug: string; publishedAt?: string }>('/blog?pageSize=100', 3600),
    fetchPublicApiList<{ slug: string }>('/case-studies?pageSize=100', 3600),
  ]);

  return [
    ...staticEntries,
    ...services.map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...blog.map((b) => ({
      url: `${SITE_URL}/blog/${b.slug}`,
      lastModified: b.publishedAt ? new Date(b.publishedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...caseStudies.map((p) => ({
      url: `${SITE_URL}/case-studies/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
