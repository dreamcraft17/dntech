interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dntech.id';

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'DN Tech',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Solusi teknologi enterprise untuk digitalisasi bisnis Anda.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jakarta',
    addressCountry: 'ID',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+62-21-1234-5678',
    contactType: 'sales',
    email: 'hello@dntech.id',
  },
  sameAs: [
    'https://linkedin.com/company/dntech',
    'https://github.com/dntech',
  ],
};

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'DN Tech',
  description: 'Layanan pengembangan perangkat lunak enterprise dan transformasi digital.',
  url: SITE_URL,
  telephone: '+62-21-1234-5678',
  email: 'hello@dntech.id',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jakarta',
    addressCountry: 'Indonesia',
  },
  openingHours: 'Mo-Fr 09:00-18:00',
  priceRange: 'Rp100.000.000 - Rp5.000.000.000',
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'DN Tech',
  url: SITE_URL,
  description: 'Solusi teknologi enterprise untuk digitalisasi bisnis Indonesia.',
  publisher: { '@type': 'Organization', name: 'DN Tech', url: SITE_URL },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleSchema(post: {
  title: string;
  description?: string;
  slug: string;
  publishedAt?: string;
  author?: string;
  image?: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Person', name: post.author || 'DN Tech Team' },
    publisher: {
      '@type': 'Organization',
      name: 'DN Tech',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    image: post.image || `${SITE_URL}/logo.png`,
    articleSection: post.category,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  };
}

export function serviceSchema(service: {
  name: string;
  description: string;
  slug: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: `${SITE_URL}/services/${service.slug}`,
    provider: { '@type': 'Organization', name: 'DN Tech', url: SITE_URL },
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    serviceType: service.category,
  };
}

export function itemListSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
