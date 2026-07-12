import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dntech.id';
export const SITE_NAME = 'DN Tech';

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
    title: 'Software Development Indonesia untuk Startup & UMKM',
    description: 'DN Tech — partner pengembangan aplikasi kustom dan konsultasi teknologi untuk startup & bisnis di Indonesia.',
    keywords: ['software development Indonesia', 'custom app development Jakarta', 'startup tech consultant'],
  },
  services: {
    title: 'Layanan Pengembangan Software & Konsultasi IT',
    description: 'Aplikasi kustom, konsultasi teknologi, dan pemeliharaan sistem untuk startup dan UMKM di Indonesia.',
    keywords: ['layanan pengembangan software', 'konsultasi IT Jakarta', 'custom app development Indonesia'],
  },
  products: {
    title: 'Produk Digital Siap Pakai untuk Bisnis Anda',
    description: 'Produk software siap pakai dari DN Tech untuk mempercepat operasional startup dan UMKM di Indonesia.',
    keywords: ['produk digital Indonesia', 'software siap pakai', 'produk teknologi UMKM'],
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
    description: 'Software house Indonesia yang fokus pada pengembangan aplikasi kustom dan konsultasi teknologi untuk startup.',
    keywords: ['tentang DN Tech', 'software house Jakarta', 'tim developer Indonesia'],
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
