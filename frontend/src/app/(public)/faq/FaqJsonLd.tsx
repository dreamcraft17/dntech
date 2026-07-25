import { JsonLd, faqSchema } from '@/components/seo/JsonLd';
import { fetchPublicApiList } from '@/lib/server-api';

async function getFaqs() {
  return fetchPublicApiList<{ question: string; answer: string }>('/faq', 300);
}

export async function FaqJsonLd() {
  const faqs = await getFaqs();
  if (!faqs.length) return null;
  return <JsonLd data={faqSchema(faqs)} />;
}
