/**
 * V2 content pillars — SEO Guide & PRD v2.
 *
 * `label`/`description`/`label` on links stay Indonesian as a non-i18n
 * fallback. Localized copy lives in `pages.pillars.*` of the message catalog:
 * `pages.pillars.<id>.label`, `pages.pillars.<id>.description`, and
 * `pages.pillars.links.<labelKey>` for the related links.
 */

export const CONTENT_PILLARS = [
  {
    id: 'tech-stack',
    label: 'Tech Stack Indonesia',
    description: 'Next.js, PostgreSQL, DevOps untuk startup lokal',
    category: 'Tech Stack',
    href: '/blog?category=Tech Stack',
    links: [
      { href: '/services', label: 'Layanan Kami', labelKey: 'services' },
      { href: '/blog', label: 'Semua Artikel', labelKey: 'allArticles' },
      { href: '/contact', label: 'Konsultasi Gratis', labelKey: 'freeConsultation' },
    ],
  },
  {
    id: 'scaling',
    label: 'Scaling Proyek Software',
    description: 'Tim remote, version control, strategi testing',
    category: 'Scaling',
    href: '/blog?category=Scaling',
    links: [
      { href: '/services', label: 'Layanan Kami', labelKey: 'services' },
      { href: '/faq', label: 'FAQ Proses Kerja', labelKey: 'processFaq' },
      { href: '/contact', label: 'Hubungi Kami', labelKey: 'contact' },
    ],
  },
  {
    id: 'startup',
    label: 'Saran Teknologi Startup',
    description: 'MVP, optimasi biaya, keamanan dasar',
    category: 'Startup',
    href: '/blog?category=Startup',
    links: [
      { href: '/blog', label: 'Artikel Startup', labelKey: 'startupArticles' },
      { href: '/about', label: 'Tentang Kami', labelKey: 'about' },
      { href: '/contact', label: 'Mulai Proyek', labelKey: 'startProject' },
    ],
  },
  {
    id: 'insights',
    label: 'Insight Kasus',
    description: 'Pelajaran dari proyek nyata (jika tersedia)',
    category: 'Case Insights',
    href: '/blog?category=Case Insights',
    links: [
      { href: '/portfolio', label: 'Portfolio', labelKey: 'portfolio' },
      { href: '/blog', label: 'Blog', labelKey: 'blog' },
      { href: '/contact', label: 'Diskusi Proyek', labelKey: 'discussProject' },
    ],
  },
] as const;

export function getPillarForCategory(category?: string) {
  if (!category) return null;
  return CONTENT_PILLARS.find((p) => p.category === category) ?? null;
}

export function getRelatedServiceLinks(
  category: string | undefined,
  services: { slug: string; name: string; category?: string | null }[],
) {
  if (!category) return [];
  return services
    .filter((s) => s.category?.toLowerCase() === category.toLowerCase())
    .map((s) => ({ href: `/services/${s.slug}`, label: s.name }));
}
