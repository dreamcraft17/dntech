import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SolutionQuiz } from '@/components/interactive/SolutionQuiz';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';
import { buildMetadata, getPageSeo, localePath, SITE_URL } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo('quiz', locale);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: '/quiz',
    keywords: seo.keywords,
    locale,
  });
}

export default async function QuizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'pages' });

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: t('breadcrumbHome'), url: `${SITE_URL}${localePath('/', locale)}` },
        { name: t('quiz.breadcrumb'), url: `${SITE_URL}${localePath('/quiz', locale)}` },
      ])} />

      <PublicPageShell width="3xl">
        <PageIntro
          kicker={t('quiz.kicker')}
          title={t('quiz.title')}
          description={t('quiz.description')}
        />
        <SaasPanel>
          <SolutionQuiz />
        </SaasPanel>
      </PublicPageShell>
    </>
  );
}
