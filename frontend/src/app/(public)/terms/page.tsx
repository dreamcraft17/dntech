import type { Metadata } from 'next';
import { fetchPublicApiSafe } from '@/lib/server-api';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { TERMS_OF_SERVICE_HTML } from '@/lib/legal-content';
import { buildMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';

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
    <PublicPageShell width="3xl">
      <PageIntro kicker="Legal" title="Syarat dan Ketentuan" description="Ketentuan penggunaan situs, formulir, konten, produk, dan layanan DN Tech." />
      <SaasPanel>
        <div className="prose max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
      </SaasPanel>
    </PublicPageShell>
  );
}
