import type { Metadata } from 'next';
import { fetchPublicApiSafe } from '@/lib/server-api';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { TERMS_OF_SERVICE_HTML } from '@/lib/legal-content';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Syarat dan Ketentuan DN Tech',
  description: 'Syarat dan ketentuan penggunaan situs, formulir, konten, produk, dan layanan DN Tech.',
  path: '/terms',
});

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
