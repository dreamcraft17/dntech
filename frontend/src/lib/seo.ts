import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dntech.id';
export const SITE_NAME = 'DN Tech';

export const DEFAULT_KEYWORDS = [
  'software development Indonesia',
  'enterprise software',
  'digital transformation',
  'web development Jakarta',
  'cloud migration',
  'DN Tech',
];

export const PAGE_SEO: Record<string, { title: string; description: string; keywords: string[] }> = {
  home: {
    title: 'Solusi Teknologi Enterprise & Digital Transformation',
    description: 'DN Tech membantu perusahaan Indonesia bertransformasi digital dengan enterprise software, web development, cloud & DevOps.',
    keywords: ['enterprise software Indonesia', 'digital transformation Jakarta', 'custom software development'],
  },
  services: {
    title: 'Layanan Teknologi Enterprise',
    description: 'Enterprise software, web & mobile development, cloud DevOps, dan IT consulting untuk bisnis skala enterprise.',
    keywords: ['enterprise software development', 'web development services', 'cloud DevOps Indonesia'],
  },
  blog: {
    title: 'Blog & Insights Teknologi',
    description: 'Artikel tentang tren enterprise, cloud migration, keamanan web, dan best practices digital transformation.',
    keywords: ['enterprise technology blog', 'cloud migration guide', 'web security best practices'],
  },
  'case-studies': {
    title: 'Case Studies & Success Stories',
    description: 'Pelajari bagaimana DN Tech membantu klien enterprise mencapai hasil measurable melalui solusi teknologi.',
    keywords: ['software development case study', 'enterprise ERP success story', 'digital transformation results'],
  },
  about: {
    title: 'Tentang DN Tech',
    description: 'Partner teknologi terpercaya sejak 2018. 100+ proyek, 50+ klien enterprise di berbagai industri.',
    keywords: ['DN Tech company', 'technology partner Indonesia', 'software company Jakarta'],
  },
  contact: {
    title: 'Hubungi Kami',
    description: 'Request demo gratis atau konsultasi dengan tim DN Tech. Respons dalam 1 hari kerja.',
    keywords: ['contact software developer', 'request demo enterprise software', 'IT consulting Jakarta'],
  },
  faq: {
    title: 'FAQ',
    description: 'Jawaban pertanyaan umum tentang layanan, timeline proyek, pricing, dan support DN Tech.',
    keywords: ['software development FAQ', 'enterprise project timeline', 'IT consulting pricing'],
  },
  quiz: {
    title: 'Solution Finder Quiz',
    description: 'Temukan layanan DN Tech yang tepat untuk kebutuhan bisnis Anda dalam 5 pertanyaan.',
    keywords: ['find software solution', 'technology assessment quiz'],
  },
  resources: {
    title: 'Resources & Guides',
    description: 'Download gratis: Enterprise Digital Transformation Guide, Cloud Migration Checklist, dan whitepapers.',
    keywords: ['enterprise app development checklist', 'digital transformation guide PDF'],
  },
};

interface BuildMetadataOptions {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path = '',
  keywords = [],
  image,
  type = 'website',
  publishedTime,
  author,
  noIndex,
}: BuildMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image || `${SITE_URL}/og-default.png`;
  const allKeywords = [...new Set([...keywords, ...DEFAULT_KEYWORDS])];

  return {
    title,
    description,
    keywords: allKeywords,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'id_ID',
      type: type === 'article' ? 'article' : 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedTime && type === 'article' ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
    ...(author && type === 'article' ? { authors: [{ name: author }] } : {}),
  };
}

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
