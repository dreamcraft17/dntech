import { JsonLd, faqSchema } from '@/components/seo/JsonLd';
import { getHomeDefaults } from '@/lib/homepage-content';
import { fetchPublicApiList } from '@/lib/server-api';

/**
 * FAQ rich results for the homepage — matches visible FAQ (API or locale defaults).
 */
export async function HomeFaqJsonLd({ locale }: { locale: string }) {
  const apiFaqs = await fetchPublicApiList<{ question: string; answer: string }>('/faq', 300);
  const faqs = (apiFaqs.length ? apiFaqs.slice(0, 8) : getHomeDefaults(locale).faq).filter(
    (f) => f.question?.trim() && f.answer?.trim()
  );
  if (!faqs.length) return null;

  return (
    <JsonLd
      data={{
        ...faqSchema(faqs),
        inLanguage: locale === 'en' ? 'en-US' : 'id-ID',
      }}
    />
  );
}
