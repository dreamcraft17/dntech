import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { fetchPublicApiSafe } from '@/lib/server-api';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { getLegalFallback, localizeLegalLinks } from '@/lib/legal-content';
import { buildMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  return buildMetadata({
    title: t('privacy.metaTitle'),
    description: t('privacy.metaDescription'),
    path: '/privacy',
    locale,
  });
}

async function getPrivacy(locale: string) {
  const data = await fetchPublicApiSafe<{ content: string }>('/settings/legal/privacy', 3600);
  return data?.content?.trim() || getLegalFallback('privacy', locale);
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [content, t] = await Promise.all([
    getPrivacy(locale),
    getTranslations({ locale, namespace: 'pages' }),
  ]);

  return (
    <PublicPageShell width="3xl">
      <PageIntro kicker={t('privacy.kicker')} title={t('privacy.title')} description={t('privacy.description')} />
      <SaasPanel>
        <div
          className="prose max-w-none prose-slate"
          dangerouslySetInnerHTML={{ __html: localizeLegalLinks(sanitizeHtml(content), locale) }}
        />
      </SaasPanel>
    </PublicPageShell>
  );
}
