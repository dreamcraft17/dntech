import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PortfolioCard } from '@/components/cards/PortfolioCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { fetchPublicApiList } from '@/lib/server-api';
import { buildMetadata, getPageSeo, localePath } from '@/lib/seo';
import type { PortfolioItem } from '@/types';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';
import { SaasEmptyState } from '@/components/layout/SaasEmptyState';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo('portfolio', locale);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: '/portfolio',
    keywords: seo.keywords,
    locale,
  });
}

async function getPortfolio() {
  return fetchPublicApiList<PortfolioItem>('/portfolio?pageSize=12', 60);
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('catalog');
  const items = await getPortfolio();
  const industries = [...new Set(items.flatMap((i) => (i.industries as string[]) || []))];

  return (
    <PublicPageShell>
      <PageIntro
        kicker={t('portfolio.kicker')}
        title={t('portfolio.title')}
        description={items.length > 0 ? t('portfolio.description') : t('portfolio.descriptionEmpty')}
      >
        <p className="text-sm text-slate-600">
          {t('portfolio.metricsPrompt')}{' '}
          <Link href="/case-studies" className="font-semibold text-blue-900 hover:underline">
            {t('portfolio.metricsLink')}
          </Link>
        </p>
      </PageIntro>

      {industries.length > 0 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {industries.map((ind) => (
            <Badge key={ind} variant="default">
              {ind}
            </Badge>
          ))}
        </div>
      )}

      {items.length > 0 ? (
        <div className="saas-card-grid lg-3">
          {items.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <SaasEmptyState
          description={t('portfolio.empty')}
          actions={
            <>
              <Button href={localePath('/products', locale)} variant="outline">
                {t('common.viewProducts')}
              </Button>
              <Button href={localePath('/contact', locale)}>{t('common.freeConsultation')}</Button>
            </>
          }
        />
      )}
      <PageEndCta />
    </PublicPageShell>
  );
}
