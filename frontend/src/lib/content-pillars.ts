/** Content pillar strategy — maps blog categories to cluster pages for internal linking */

export const CONTENT_PILLARS = [
  {
    id: 'trends',
    label: 'Industry Trends',
    description: 'Thought leadership & enterprise technology trends',
    category: 'Technology',
    href: '/blog?category=Technology',
    links: [
      { href: '/services/enterprise-software', label: 'Enterprise Software' },
      { href: '/services/it-consulting', label: 'IT Consulting' },
      { href: '/case-studies', label: 'Success Stories' },
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud & DevOps',
    description: 'Migration guides & infrastructure best practices',
    category: 'Cloud',
    href: '/blog?category=Cloud',
    links: [
      { href: '/services/cloud-devops', label: 'Cloud & DevOps Services' },
      { href: '/resources', label: 'Cloud Migration Checklist' },
      { href: '/contact', label: 'Get Cloud Assessment' },
    ],
  },
  {
    id: 'security',
    label: 'Security & Quality',
    description: 'Web security, OWASP, and development best practices',
    category: 'Security',
    href: '/blog?category=Security',
    links: [
      { href: '/services/web-mobile-development', label: 'Web Development' },
      { href: '/faq', label: 'Security FAQ' },
      { href: '/quiz', label: 'Find Your Solution' },
    ],
  },
  {
    id: 'success',
    label: 'Customer Success',
    description: 'Real results from enterprise clients',
    category: 'Success Stories',
    href: '/case-studies',
    links: [
      { href: '/case-studies/erp-manufaktur', label: 'ERP Manufacturing' },
      { href: '/case-studies/mobile-banking', label: 'Mobile Banking' },
      { href: '/testimonials', label: 'Client Testimonials' },
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
