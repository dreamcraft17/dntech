import { JsonLd, faqSchema } from '@/components/seo/JsonLd';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getFaqs() {
  try {
    const res = await fetch(`${API_URL}/faq`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return (await res.json()).data as { question: string; answer: string }[];
  } catch {
    return [];
  }
}

export async function FaqJsonLd() {
  const faqs = await getFaqs();
  if (!faqs.length) return null;
  return <JsonLd data={faqSchema(faqs)} />;
}
