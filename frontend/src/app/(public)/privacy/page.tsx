import type { Metadata } from 'next';
import { fetchPublicApiSafe } from '@/lib/server-api';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { PRIVACY_POLICY_HTML } from '@/lib/legal-content';
import { buildMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';

export const metadata: Metadata = buildMetadata({
  title: 'Kebijakan Privasi DN Tech',
  description: 'Kebijakan privasi DN Tech tentang pengumpulan, penggunaan, penyimpanan, dan perlindungan data pribadi di situs kami.',
  path: '/privacy',
});

async function getPrivacy() {
  const data = await fetchPublicApiSafe<{ content: string }>('/settings/legal/privacy', 3600);
  return data?.content?.trim() || PRIVACY_POLICY_HTML;
}

export default async function PrivacyPage() {
  const content = await getPrivacy();

  return (
    <PublicPageShell width="3xl">
      <PageIntro kicker="Legal" title="Kebijakan Privasi" description="Cara kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi di situs DN Tech." />
      <SaasPanel>
        <div className="prose max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
      </SaasPanel>
    </PublicPageShell>
  );
}
