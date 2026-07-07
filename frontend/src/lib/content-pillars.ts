/** V2 content pillars — SEO Guide & PRD v2 */

export const CONTENT_PILLARS = [
  {
    id: 'tech-stack',
    label: 'Tech Stack Indonesia',
    description: 'Next.js, PostgreSQL, DevOps untuk startup lokal',
    category: 'Tech Stack',
    href: '/blog?category=Tech Stack',
    links: [
      { href: '/services', label: 'Layanan Kami' },
      { href: '/blog', label: 'Semua Artikel' },
      { href: '/contact', label: 'Konsultasi Gratis' },
    ],
  },
  {
    id: 'scaling',
    label: 'Scaling Proyek Software',
    description: 'Tim remote, version control, strategi testing',
    category: 'Scaling',
    href: '/blog?category=Scaling',
    links: [
      { href: '/services', label: 'Layanan Kami' },
      { href: '/faq', label: 'FAQ Proses Kerja' },
      { href: '/contact', label: 'Hubungi Kami' },
    ],
  },
  {
    id: 'startup',
    label: 'Saran Teknologi Startup',
    description: 'MVP, optimasi biaya, keamanan dasar',
    category: 'Startup',
    href: '/blog?category=Startup',
    links: [
      { href: '/blog', label: 'Artikel Startup' },
      { href: '/about', label: 'Tentang Kami' },
      { href: '/contact', label: 'Mulai Proyek' },
    ],
  },
  {
    id: 'insights',
    label: 'Insight Kasus',
    description: 'Pelajaran dari proyek nyata (jika tersedia)',
    category: 'Case Insights',
    href: '/blog?category=Case Insights',
    links: [
      { href: '/portfolio', label: 'Portfolio' },
      { href: '/blog', label: 'Blog' },
      { href: '/contact', label: 'Diskusi Proyek' },
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
