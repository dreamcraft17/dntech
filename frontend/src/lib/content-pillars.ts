/** Content pillar strategy — maps blog categories to cluster pages for internal linking */

export const CONTENT_PILLARS = [
  {
    id: 'trends',
    label: 'Tren Industri',
    description: 'Thought leadership & tren teknologi enterprise',
    category: 'Technology',
    href: '/blog?category=Technology',
    links: [
      { href: '/services', label: 'Layanan Kami' },
      { href: '/case-studies', label: 'Kisah Sukses' },
      { href: '/blog', label: 'Semua Artikel' },
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud & DevOps',
    description: 'Panduan migrasi & best practice infrastruktur',
    category: 'Cloud',
    href: '/blog?category=Cloud',
    links: [
      { href: '/services', label: 'Layanan Kami' },
      { href: '/resources', label: 'Sumber Daya' },
      { href: '/contact', label: 'Asesmen Cloud Gratis' },
    ],
  },
  {
    id: 'security',
    label: 'Keamanan & Kualitas',
    description: 'Keamanan web, OWASP, dan best practice pengembangan',
    category: 'Security',
    href: '/blog?category=Security',
    links: [
      { href: '/services', label: 'Layanan Kami' },
      { href: '/faq', label: 'FAQ Keamanan' },
      { href: '/quiz', label: 'Temukan Solusi Anda' },
    ],
  },
  {
    id: 'success',
    label: 'Kesuksesan Klien',
    description: 'Hasil nyata dari klien enterprise',
    category: 'Success Stories',
    href: '/case-studies',
    links: [
      { href: '/case-studies', label: 'Semua Studi Kasus' },
      { href: '/testimonials', label: 'Testimoni Klien' },
      { href: '/contact', label: 'Hubungi Kami' },
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
