/** Content pillar strategy — maps blog categories to cluster pages for internal linking */

export const CONTENT_PILLARS = [
  {
    id: 'trends',
    label: 'Tren Industri',
    description: 'Thought leadership & tren teknologi enterprise',
    category: 'Technology',
    href: '/blog?category=Technology',
    links: [
      { href: '/services/enterprise-software', label: 'Perangkat Lunak Enterprise' },
      { href: '/services/it-consulting', label: 'Konsultasi IT' },
      { href: '/case-studies', label: 'Kisah Sukses' },
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud & DevOps',
    description: 'Panduan migrasi & best practice infrastruktur',
    category: 'Cloud',
    href: '/blog?category=Cloud',
    links: [
      { href: '/services/cloud-devops', label: 'Layanan Cloud & DevOps' },
      { href: '/resources', label: 'Checklist Migrasi Cloud' },
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
      { href: '/services/web-mobile-development', label: 'Pengembangan Web' },
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
      { href: '/case-studies/erp-manufaktur', label: 'ERP Manufaktur' },
      { href: '/case-studies/mobile-banking', label: 'Mobile Banking' },
      { href: '/testimonials', label: 'Testimoni Klien' },
    ],
  },
] as const;

/** Maps blog categories to related service slugs for contextual internal links */
export const CATEGORY_SERVICE_MAP: Record<string, string[]> = {
  Technology: ['enterprise-software', 'it-consulting'],
  Cloud: ['cloud-devops'],
  Security: ['web-mobile-development'],
  Development: ['web-mobile-development', 'enterprise-software'],
  'Success Stories': [],
};

/** Maps service slugs to blog categories for related articles */
export const SERVICE_BLOG_CATEGORY: Record<string, string> = {
  'enterprise-software': 'Technology',
  'web-mobile-development': 'Security',
  'cloud-devops': 'Cloud',
  'it-consulting': 'Technology',
};

export function getPillarForCategory(category?: string) {
  if (!category) return null;
  return CONTENT_PILLARS.find((p) => p.category === category) ?? null;
}

export function getRelatedServiceSlugs(category?: string): string[] {
  if (!category) return [];
  return CATEGORY_SERVICE_MAP[category] ?? [];
}
