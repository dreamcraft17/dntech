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

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'DN Tech',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dntech.id',
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://dntech.id'}/logo.png`,
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
  description: 'Enterprise software development and digital transformation services.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dntech.id',
  telephone: '+62-21-1234-5678',
  email: 'hello@dntech.id',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jakarta',
    addressCountry: 'Indonesia',
  },
  openingHours: 'Mo-Fr 09:00-18:00',
  priceRange: '$$',
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
