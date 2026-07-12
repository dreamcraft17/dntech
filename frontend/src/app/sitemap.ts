import type { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
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

  try {
    const [servicesRes, productsRes, blogRes, caseStudiesRes] = await Promise.all([
      fetch(`${API_URL}/services`),
      fetch(`${API_URL}/products`),
      fetch(`${API_URL}/blog?pageSize=100`),
      fetch(`${API_URL}/case-studies?pageSize=100`),
    ]);

    const services = servicesRes.ok ? (await servicesRes.json()).data : [];
    const products = productsRes.ok ? (await productsRes.json()).data : [];
    const blog = blogRes.ok ? (await blogRes.json()).data : [];
    const caseStudies = caseStudiesRes.ok ? (await caseStudiesRes.json()).data : [];

    return [
      ...staticEntries,
      ...services.map((s: { slug: string; updatedAt?: string }) => ({
        url: `${SITE_URL}/services/${s.slug}`,
        lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...products.map((p: { slug: string; updatedAt?: string }) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...blog.map((b: { slug: string; publishedAt?: string }) => ({
        url: `${SITE_URL}/blog/${b.slug}`,
        lastModified: b.publishedAt ? new Date(b.publishedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
      ...caseStudies.map((p: { slug: string }) => ({
        url: `${SITE_URL}/case-studies/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticEntries;
  }
}
