import type { PublicSettings } from '@/lib/settings';

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

export function buildOrganizationSchema(settings: PublicSettings = {}) {
  const social = settings.socialLinks ?? {};
  const sameAs = Object.values(social).filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.companyName || 'DN Tech',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: settings.heroDescription || settings.tagline || undefined,
    ...(settings.companyAddress ? {
      address: {
        '@type': 'PostalAddress',
        addressLocality: settings.companyAddress,
        addressCountry: 'ID',
      },
    } : {}),
    ...(settings.companyEmail || settings.companyPhone ? {
      contactPoint: {
        '@type': 'ContactPoint',
        ...(settings.companyPhone ? { telephone: settings.companyPhone } : {}),
        ...(settings.companyEmail ? { email: settings.companyEmail } : {}),
        contactType: 'sales',
      },
    } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function buildLocalBusinessSchema(settings: PublicSettings = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.companyName || 'DN Tech',
    description: settings.heroDescription || settings.tagline || undefined,
    url: SITE_URL,
    ...(settings.companyPhone ? { telephone: settings.companyPhone } : {}),
    ...(settings.companyEmail ? { email: settings.companyEmail } : {}),
    ...(settings.companyAddress ? {
      address: {
        '@type': 'PostalAddress',
        addressLocality: settings.companyAddress,
        addressCountry: 'Indonesia',
      },
    } : {}),
    ...(settings.businessHours ? { openingHours: settings.businessHours } : {}),
  };
}

export function buildWebsiteSchema(settings: PublicSettings = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.companyName || 'DN Tech',
    url: SITE_URL,
    description: settings.tagline || undefined,
    publisher: { '@type': 'Organization', name: settings.companyName || 'DN Tech', url: SITE_URL },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

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
}, companyName = 'DN Tech') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Person', name: post.author || companyName },
    publisher: {
      '@type': 'Organization',
      name: companyName,
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
}, companyName = 'DN Tech') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: `${SITE_URL}/services/${service.slug}`,
    provider: { '@type': 'Organization', name: companyName, url: SITE_URL },
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
