import type { Metadata } from 'next';
import { fetchPublicApiSafe } from '@/lib/server-api';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { PRIVACY_POLICY_HTML } from '@/lib/legal-content';

export const metadata: Metadata = { title: 'Kebijakan Privasi' };

async function getPrivacy() {
  const data = await fetchPublicApiSafe<{ content: string }>('/settings/legal/privacy', 3600);
  return data?.content?.trim() || PRIVACY_POLICY_HTML;
}

export default async function PrivacyPage() {
  const content = await getPrivacy();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
      </div>
    </div>
  );
}
