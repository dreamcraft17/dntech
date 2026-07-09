import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import { asArray } from '@/lib/api';
import { getPublicSettings } from '@/lib/settings';
import { resolveHomeContent, DEFAULT_FAQ } from '@/lib/homepage-content';
import type { Service, Faq } from '@/types';
import type { Metadata } from 'next';
import { HomeHero } from '@/components/homepage/HomeHero';
import { HomeServices } from '@/components/homepage/HomeServices';
import { HomeProcess } from '@/components/homepage/HomeProcess';
import { HomeAdvantages } from '@/components/homepage/HomeAdvantages';
import { HomePortfolio } from '@/components/homepage/HomePortfolio';
import { HomeTestimonials } from '@/components/homepage/HomeTestimonials';
import { HomeFaq } from '@/components/homepage/HomeFaq';
import { HomePricing } from '@/components/homepage/HomePricing';
import { HomeContactCta } from '@/components/homepage/HomeContactCta';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.home.title,
  description: PAGE_SEO.home.description,
  path: '/',
  keywords: PAGE_SEO.home.keywords,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function fetchJson<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return asArray<T>(json.data);
  } catch {
    return [];
  }
}

interface CaseStudyPreview {
  id: string;
  slug: string;
  title: string;
  description?: string;
  clientName?: string;
  challenge?: string;
  solution?: string;
  results?: string;
  heroImage?: string;
  heroImageAlt?: string;
}

export default async function HomePage() {
  const settings = await getPublicSettings();
  const content = resolveHomeContent(settings);

  const [services, caseStudies, faqs, testimonials] = await Promise.all([
    fetchJson<Service>('/services?pageSize=6'),
    fetchJson<CaseStudyPreview>('/case-studies?pageSize=3'),
    fetchJson<Faq>('/faq'),
    fetchJson<{ id: string; quote: string; author: string; title?: string; company?: string }>(
      '/branding/testimonials'
    ),
  ]);

  const faqItems =
    faqs.length > 0
      ? faqs.slice(0, 8).map((f) => ({ id: f.id, question: f.question, answer: f.answer }))
      : DEFAULT_FAQ.map((f, i) => ({
          id: `default-faq-${i}`,
          question: f.question,
          answer: f.answer,
        }));

  return (
    <>
      <HomeHero content={content} />
      <HomeServices services={services} defaults={content.defaultServices} />
      <HomeProcess steps={content.processSteps} />
      <HomeAdvantages advantages={content.advantages} />
      <HomePortfolio projects={caseStudies} comingSoonMessage={content.portfolioMessage} />
      <HomeTestimonials
        testimonials={testimonials}
        comingSoonMessage={content.testimonialsMessage}
      />
      <HomeFaq items={faqItems} />
      <HomePricing plans={content.pricing} />
      <HomeContactCta settings={settings} />
    </>
  );
}
