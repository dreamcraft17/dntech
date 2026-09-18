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

export const PAGE_SEO: Record<string, { title: string; description: string; keywords: string[] }> = {
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
  const ogImage = image || `${SITE_URL}/rlogo2.png`;
  const allKeywords = [...new Set([...keywords, ...DEFAULT_KEYWORDS])];
  const metaTitle = title.length > 60 ? `${title.slice(0, 57)}...` : title;
  const metaDesc = description.length > 160 ? `${description.slice(0, 157)}...` : description;

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: allKeywords,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: `${metaTitle} | ${SITE_NAME}`,
      description: metaDesc,
      url,
      siteName: SITE_NAME,
      locale: 'id_ID',
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
