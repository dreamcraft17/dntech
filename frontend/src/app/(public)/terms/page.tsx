import type { Metadata } from 'next';
import { fetchPublicApiSafe } from '@/lib/server-api';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { TERMS_OF_SERVICE_HTML } from '@/lib/legal-content';

export const metadata: Metadata = { title: 'Syarat & Ketentuan' };

async function getTerms() {
  const data = await fetchPublicApiSafe<{ content: string }>('/settings/legal/terms', 3600);
  return data?.content?.trim() || TERMS_OF_SERVICE_HTML;
}

export default async function TermsPage() {
  const content = await getTerms();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
      </div>
    </div>
  );
}
