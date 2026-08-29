import { fetchPublicApiList } from '@/lib/server-api';
import { DEFAULT_FAQ } from '@/lib/homepage-content';
import type { resolveHomeContent } from '@/lib/homepage-content';
import type { PublicSettings } from '@/lib/settings';
import type { Service, Faq, Product } from '@/types';
import { HomeProducts } from '@/components/homepage/HomeProducts';
import { HomeServices } from '@/components/homepage/HomeServices';
import { HomeProcess } from '@/components/homepage/HomeProcess';
import { HomeAdvantages } from '@/components/homepage/HomeAdvantages';
import { HomeFaq } from '@/components/homepage/HomeFaq';
import { HomePricing } from '@/components/homepage/HomePricing';
import { HomeContactCta } from '@/components/homepage/HomeContactCta';

type HomeContent = ReturnType<typeof resolveHomeContent>;

export function HomeBelowFoldFallback() {
  return (
    <div className="bg-surface py-section" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-600">Memuat produk dan layanan…</p>
      </div>
    </div>
  );
}

export async function HomeBelowFold({
  content,
  settings,
}: {
  content: HomeContent;
  settings: PublicSettings;
}) {
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
