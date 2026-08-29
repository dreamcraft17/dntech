import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import { getPublicSettings } from '@/lib/settings';
import { resolveHomeContent, DEFAULT_FAQ } from '@/lib/homepage-content';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Service, Faq, Product } from '@/types';
import type { Metadata } from 'next';
import { HomeHero } from '@/components/homepage/HomeHero';
import { HomeProducts } from '@/components/homepage/HomeProducts';
import { HomeServices } from '@/components/homepage/HomeServices';
import { HomeProcess } from '@/components/homepage/HomeProcess';
import { HomeAdvantages } from '@/components/homepage/HomeAdvantages';
import { HomeFaq } from '@/components/homepage/HomeFaq';
import { HomePricing } from '@/components/homepage/HomePricing';
import { HomeContactCta } from '@/components/homepage/HomeContactCta';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.home.title,
  description: PAGE_SEO.home.description,
  path: '/',
  keywords: PAGE_SEO.home.keywords,
});

export default async function HomePage() {
  const settings = await getPublicSettings();
  const content = resolveHomeContent(settings);

  // Skip case-studies + branding/testimonials: empty lists still cost SSR RTT
  // and paint fake-proof chrome. Routes /case-studies and /testimonials stay.
  const [services, homepageProducts, faqs] = await Promise.all([
    fetchPublicApiList<Service>('/services', 300),
    fetchPublicApiList<Product>('/products?homepage=true', 300),
    fetchPublicApiList<Faq>('/faq', 300),
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
      <HomeProducts products={homepageProducts.slice(0, 6)} />
      <HomeServices services={services} defaults={content.defaultServices} />
      <HomeProcess steps={content.processSteps} />
      <HomeAdvantages advantages={content.advantages} />
      <HomeFaq items={faqItems} />
      <HomePricing plans={content.pricing} />
      <HomeContactCta settings={settings} />
    </>
  );
}
