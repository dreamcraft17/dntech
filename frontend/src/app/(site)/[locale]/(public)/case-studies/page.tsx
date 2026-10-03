import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CaseStudyCard } from '@/components/cards/CaseStudyCard';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { buildMetadata, getPageSeo, localePath, SITE_URL } from '@/lib/seo';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Metadata } from 'next';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';
import { SaasEmptyState } from '@/components/layout/SaasEmptyState';
import { Button } from '@/components/ui/Button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo('case-studies', locale);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: '/case-studies',
    keywords: seo.keywords,
    locale,
  });
}

interface CaseStudy {
  slug: string;
  title: string;
  description?: string;
  clientName?: string;
  metrics?: Record<string, string>;
  industries?: string[];
}

async function getCaseStudies() {
  return fetchPublicApiList<CaseStudy>('/case-studies?pageSize=50', 60);
}

export default async function CaseStudiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('catalog');
  const items = await getCaseStudies();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: t('breadcrumb.home'), url: `${SITE_URL}${localePath('/', locale)}` },
        { name: t('breadcrumb.caseStudies'), url: `${SITE_URL}${localePath('/case-studies', locale)}` },
      ])} />

      <PublicPageShell>
          <PageIntro
            kicker={t('caseStudies.kicker')}
            title={t('caseStudies.title')}
            description={items.length > 0 ? t('caseStudies.description') : t('caseStudies.descriptionEmpty')}
          />

          {items.length > 0 ? (
            <div className="saas-card-grid lg-3">
              {items.map((item) => (
                <CaseStudyCard
                  key={item.slug}
                  slug={item.slug}
                  title={item.title}
                  description={item.description}
                  clientName={item.clientName}
                  metrics={item.metrics}
                  industries={item.industries}
                />
              ))}
            </div>
          ) : (
            <SaasEmptyState
              description={
                <>
                  {t('caseStudies.empty')}
                  <span className="mt-2 block text-gray-500">{t('caseStudies.emptyHint')}</span>
                </>
              }
              actions={
                <>
                  <Button href={localePath('/products', locale)} variant="outline">
                    {t('common.viewProducts')}
                  </Button>
                  <Button href={localePath('/blog', locale)}>{t('common.readBlog')}</Button>
                </>
              }
            />
          )}

          <PageEndCta />
      </PublicPageShell>
    </>
  );
}
