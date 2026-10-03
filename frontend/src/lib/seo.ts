import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dntech.id';
export const SITE_NAME = 'DN Tech';
export const DEFAULT_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;
export const DEFAULT_SITE_DESCRIPTION =
  'DN Tech membangun aplikasi kustom, integrasi sistem, dan software operasional untuk startup dan bisnis Indonesia—dengan scope, timeline, dan harga yang jelas.';

export const DEFAULT_KEYWORDS = [
  'software development Indonesia',
  'custom app development Jakarta',
  'startup tech consultant',
  'sewa developer Indonesia',
  'tim development outsource',
  'DN Tech',
];

interface PageSeoEntry {
  title: string;
  description: string;
  keywords: string[];
}

export const PAGE_SEO: Record<string, PageSeoEntry> = {
  home: {
    title: 'Software Development Indonesia untuk MVP & Workflow Bisnis',
    description:
      'DN Tech membantu startup dan bisnis Indonesia membangun MVP, menghubungkan sistem, dan merapikan workflow operasional dengan scope, timeline, dan harga yang jelas.',
    keywords: ['software development Indonesia', 'MVP development Indonesia', 'integrasi API sistem bisnis'],
  },
  services: {
    title: 'Jasa Website, Aplikasi Custom & Integrasi Sistem',
    description: 'DN Tech membuat website company profile, aplikasi custom, MVP, dan integrasi sistem untuk bisnis Indonesia.',
    keywords: ['jasa website company profile', 'jasa aplikasi custom Indonesia', 'MVP development Indonesia', 'integrasi API sistem bisnis'],
  },
  products: {
    title: 'HRIS, ERP & Pembukuan untuk Bisnis Indonesia',
    description:
      'Software HRIS, ERP, dan pembukuan Shopee dari DN Tech untuk startup & UKM. Fitur, harga, dan status rilis di setiap halaman produk.',
    keywords: [
      'HRIS Indonesia',
      'ERP software Indonesia',
      'pembukuan Shopee',
      'software UKM Indonesia',
      'dnPeople',
      'dnCore',
    ],
  },
  blog: {
    title: 'Blog Teknologi untuk Founder & Tim Produk',
    description: 'Artikel tentang tech stack, scaling software, dan saran teknologi untuk startup Indonesia.',
    keywords: ['blog tech startup Indonesia', 'MVP development guide', 'tech stack startup'],
  },
  'case-studies': {
    title: 'Portfolio & Studi Kasus',
    description: 'Proyek nyata dari klien DN Tech — hanya dipublikasikan dengan izin klien.',
    keywords: ['portfolio software development', 'studi kasus aplikasi Indonesia'],
  },
  about: {
    title: 'Tentang DN Tech',
    description: 'DN Tech membangun dan menghubungkan software untuk workflow penting bisnis Indonesia.',
    keywords: ['tentang DN Tech', 'software studio Indonesia', 'workflow bisnis', 'tim developer Indonesia'],
  },
  contact: {
    title: 'Hubungi Kami — Konsultasi Gratis',
    description: 'Mulai konsultasi gratis dengan tim DN Tech. Respons dalam 24 jam kerja.',
    keywords: ['hubungi developer Indonesia', 'konsultasi software gratis', 'request quote aplikasi'],
  },
  faq: {
    title: 'Pertanyaan Umum (FAQ)',
    description: 'Jawaban tentang layanan, proses kerja, pricing, dan dukungan DN Tech.',
    keywords: ['FAQ pengembangan software', 'proses kerja software house', 'biaya develop aplikasi'],
  },
  quiz: {
    title: 'Temukan Solusi Teknologi Anda',
    description: 'Kuis singkat untuk menemukan layanan DN Tech yang sesuai kebutuhan bisnis Anda.',
    keywords: ['temukan solusi software', 'asesmen kebutuhan teknologi'],
  },
  resources: {
    title: 'Sumber Daya & Panduan',
    description: 'Panduan dan checklist gratis dari DN Tech.',
    keywords: ['panduan transformasi digital', 'checklist development startup'],
  },
  team: {
    title: 'Tim Kami',
    description: 'Kenali tim DN Tech — developer dan konsultan teknologi di balik proyek Anda.',
    keywords: ['tim DN Tech', 'developer Indonesia', 'software engineer Jakarta'],
  },
  portfolio: {
    title: 'Portofolio',
    description:
      'Portofolio proyek DN Tech — dipublikasikan hanya dengan izin klien. Saat ini belum ada item publik.',
    keywords: ['portfolio software development', 'studi kasus aplikasi Indonesia'],
  },
};

export const PAGE_SEO_EN: Record<string, PageSeoEntry> = {
  home: {
    title: 'Software Development in Indonesia for MVPs & Business Workflows',
    description:
      'DN Tech helps startups and companies build MVPs, connect systems, and clean up operational workflows — with clear scope, timeline, and pricing.',
    keywords: ['software development Indonesia', 'MVP development Indonesia', 'business system API integration'],
  },
  services: {
    title: 'Website, Custom App & System Integration Services',
    description:
      'DN Tech builds company profile websites, custom applications, MVPs, and system integrations for businesses in Indonesia.',
    keywords: ['company profile website service', 'custom app development Indonesia', 'MVP development Indonesia', 'system API integration'],
  },
  products: {
    title: 'HRIS, ERP & Bookkeeping Software for Growing Businesses',
    description:
      'HRIS, ERP, and Shopee bookkeeping software from DN Tech for startups and SMEs. Features, pricing, and release status on every product page.',
    keywords: ['HRIS Indonesia', 'ERP software Indonesia', 'Shopee bookkeeping', 'SME software Indonesia', 'dnPeople', 'dnCore'],
  },
  blog: {
    title: 'Technology Blog for Founders & Product Teams',
    description: 'Articles on tech stacks, scaling software, and technology decisions for startups in Indonesia.',
    keywords: ['startup tech blog Indonesia', 'MVP development guide', 'startup tech stack'],
  },
  'case-studies': {
    title: 'Portfolio & Case Studies',
    description: 'Real client projects from DN Tech — published only with client permission.',
    keywords: ['software development portfolio', 'application case studies Indonesia'],
  },
  about: {
    title: 'About DN Tech',
    description: 'DN Tech builds and connects the software behind the workflows Indonesian businesses rely on.',
    keywords: ['about DN Tech', 'software studio Indonesia', 'business workflows', 'Indonesian development team'],
  },
  contact: {
    title: 'Contact Us — Free Consultation',
    description: 'Start a free consultation with the DN Tech team. We reply within 24 business hours.',
    keywords: ['contact Indonesian developers', 'free software consultation', 'request app quote'],
  },
  faq: {
    title: 'Frequently Asked Questions',
    description: 'Answers about DN Tech services, how we work, pricing, and support.',
    keywords: ['software development FAQ', 'software house process', 'app development cost'],
  },
  quiz: {
    title: 'Find Your Technology Solution',
    description: 'A short quiz to find the DN Tech service that fits your business needs.',
    keywords: ['find software solution', 'technology needs assessment'],
  },
  resources: {
    title: 'Resources & Guides',
    description: 'Free guides and checklists from DN Tech.',
    keywords: ['digital transformation guide', 'startup development checklist'],
  },
  team: {
    title: 'Our Team',
    description: 'Meet the DN Tech team — the developers and technology consultants behind your project.',
    keywords: ['DN Tech team', 'Indonesian developers', 'software engineers Jakarta'],
  },
  portfolio: {
    title: 'Portfolio',
    description:
      'DN Tech project portfolio — published only with client permission. No public items at the moment.',
    keywords: ['software development portfolio', 'application case studies Indonesia'],
  },
};

/** Page-level SEO copy for a locale, falling back to the Indonesian entry. */
export function getPageSeo(key: string, locale: string): PageSeoEntry {
  const table = locale === 'en' ? PAGE_SEO_EN : PAGE_SEO;
  return table[key] ?? PAGE_SEO[key];
}

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
  locale?: string;
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
  locale,
}: BuildMetadataOptions): Metadata {
  const url = `${SITE_URL}${locale ? localePath(path, locale) : path}`;
  const ogImage = image || `${SITE_URL}/rlogo2.png`;
  const allKeywords = [...new Set([...keywords, ...DEFAULT_KEYWORDS])];
  const metaTitle = title.length > 60 ? `${title.slice(0, 57)}...` : title;
  const metaDesc = description.length > 160 ? `${description.slice(0, 157)}...` : description;

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: allKeywords,
    alternates: locale ? localeAlternates(path, locale) : { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: `${metaTitle} | ${SITE_NAME}`,
      description: metaDesc,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale as keyof typeof OG_LOCALES] ?? OG_LOCALES.id,
      type: type === 'article' ? 'article' : 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: metaTitle }],
      ...(publishedTime && type === 'article' ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${metaTitle} | ${SITE_NAME}`,
      description: metaDesc,
      images: [ogImage],
    },
    ...(author && type === 'article' ? { authors: [{ name: author }] } : {}),
  };
}

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const OG_LOCALES = { id: 'id_ID', en: 'en_US' } as const;

/** Turns a locale-agnostic route ('/about') into its prefixed form ('/en/about'). */
export function localePath(path: string, locale: string) {
  const normalized = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalized}`;
}

/**
 * Canonical + hreflang set for one route. x-default points at the Indonesian
 * version, which is the company's primary market.
 */
export function localeAlternates(path: string, locale: string): Metadata['alternates'] {
  return {
    canonical: `${SITE_URL}${localePath(path, locale)}`,
    languages: {
      id: `${SITE_URL}${localePath(path, 'id')}`,
      en: `${SITE_URL}${localePath(path, 'en')}`,
      'x-default': `${SITE_URL}${localePath(path, 'id')}`,
    },
  };
}
