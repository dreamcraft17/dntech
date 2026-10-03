import { JsonLd, faqSchema } from '@/components/seo/JsonLd';
import { fetchPublicApiList } from '@/lib/server-api';

async function getFaqs() {
  return fetchPublicApiList<{ question: string; answer: string }>('/faq', 300);
}

/**
 * `inLanguage` follows the route locale so each localized FAQ URL advertises
 * its own language. The entries themselves still come from the backend in a
 * single language — add locale support to `/faq` to make this fully accurate.
 */
export async function FaqJsonLd({ locale }: { locale: string }) {
  const faqs = await getFaqs();
  if (!faqs.length) return null;
  return <JsonLd data={{ ...faqSchema(faqs), inLanguage: locale === 'en' ? 'en-US' : 'id-ID' }} />;
}
