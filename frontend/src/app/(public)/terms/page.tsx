import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service' };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getTerms() {
  try {
    const res = await fetch(`${API_URL}/settings/legal/terms`, { next: { revalidate: 3600 } });
    if (!res.ok) return '';
    return (await res.json()).data.content as string;
  } catch {
    return '<h1>Terms of Service</h1><p>Content coming soon.</p>';
  }
}

export default async function TermsPage() {
  const content = await getTerms();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
