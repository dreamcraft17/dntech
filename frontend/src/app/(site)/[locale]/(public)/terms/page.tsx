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
    title: t('terms.metaTitle'),
    description: t('terms.metaDescription'),
    path: '/terms',
    locale,
  });
}

async function getTerms(locale: string) {
  const data = await fetchPublicApiSafe<{ content: string }>('/settings/legal/terms', 3600);
  return data?.content?.trim() || getLegalFallback('terms', locale);
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [content, t] = await Promise.all([
    getTerms(locale),
    getTranslations({ locale, namespace: 'pages' }),
  ]);

  return (
    <PublicPageShell width="3xl">
      <PageIntro kicker={t('terms.kicker')} title={t('terms.title')} description={t('terms.description')} />
      <SaasPanel>
        <div
          className="prose max-w-none prose-slate"
          dangerouslySetInnerHTML={{ __html: localizeLegalLinks(sanitizeHtml(content), locale) }}
        />
      </SaasPanel>
    </PublicPageShell>
  );
}
