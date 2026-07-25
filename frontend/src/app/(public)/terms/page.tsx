import type { Metadata } from 'next';
import { fetchPublicApiSafe } from '@/lib/server-api';

export const metadata: Metadata = { title: 'Syarat & Ketentuan' };

const FALLBACK = '<h1>Syarat & Ketentuan</h1><p>Konten segera hadir.</p>';

async function getTerms() {
  const data = await fetchPublicApiSafe<{ content: string }>('/settings/legal/terms', 3600);
  return data?.content || FALLBACK;
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
