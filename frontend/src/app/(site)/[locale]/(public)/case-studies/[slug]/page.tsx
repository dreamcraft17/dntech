import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, CheckCircle, Quote } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { buildMetadata, localePath, SITE_URL } from '@/lib/seo';
import { fetchPublicApiSafe } from '@/lib/server-api';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';

type RouteParams = Promise<{ locale: string; slug: string }>;

interface CaseStudy {
  slug: string;
  title: string;
  description?: string;
  challenge?: string;
  solution?: string;
  results?: string;
  metrics?: Record<string, string>;
  clientName?: string;
  clientLogo?: string;
  clientQuote?: string;
  industries?: string[];
  heroImage?: string;
  heroImageAlt?: string;
}

async function getCaseStudy(slug: string) {
  return fetchPublicApiSafe<CaseStudy>(`/case-studies/${slug}`, 60);
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'catalog' });
  const item = await getCaseStudy(slug);
  if (!item) return { title: t('caseStudies.metadataFallback') };
  return buildMetadata({
    title: item.title,
    description: item.description || '',
    path: `/case-studies/${slug}`,
    keywords: [...(item.industries || []), 'case study', 'software Indonesia'],
    image: item.heroImage,
    locale,
  });
}

export default async function CaseStudyDetailPage({ params }: { params: RouteParams }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('catalog');
  const item = await getCaseStudy(slug);
  if (!item) notFound();

  const caseStudiesUrl = `${SITE_URL}${localePath('/case-studies', locale)}`;

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: t('breadcrumb.home'), url: `${SITE_URL}${localePath('/', locale)}` },
        { name: t('breadcrumb.caseStudies'), url: caseStudiesUrl },
        { name: item.title, url: `${caseStudiesUrl}/${slug}` },
      ])} />

      <PublicPageShell width="4xl">
          <nav className="mb-8 text-sm text-gray-500" aria-label={t('breadcrumb.aria')}>
            <Link href="/" className="text-blue-900 hover:underline">{t('breadcrumb.home')}</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <Link href="/case-studies" className="text-blue-900 hover:underline">{t('breadcrumb.caseStudies')}</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-gray-900">{item.title}</span>
          </nav>

          {/* Hero — solid colors only (V2.1 mandate) */}
          {item.heroImage ? (
            <div className="relative mb-8 h-56 overflow-hidden rounded-lg sm:h-72">
              <Image
                src={item.heroImage}
                alt={item.heroImageAlt || item.title}
                fill
                priority
                quality={80}
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6">
                <div>
                  {item.industries && item.industries.length > 0 && (
                    <span className="inline-flex rounded-full border border-white/30 bg-white px-3 py-1 text-xs font-medium text-blue-900">
                      {item.industries[0]}
                    </span>
                  )}
                  <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{item.title}</h1>
                  {item.clientName && <p className="mt-1 text-blue-100">{item.clientName}</p>}
                </div>
                {item.clientLogo && (
                  <Image
                    src={item.clientLogo}
                    alt={item.clientName || t('caseStudies.detail.clientLogoAlt')}
                    width={120}
                    height={40}
                    quality={80}
                    sizes="120px"
                    className="hidden h-10 w-auto rounded bg-white p-1 object-contain sm:block"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="mb-8 rounded-lg bg-blue-900 px-6 py-12 text-white sm:px-8">
              {item.industries && item.industries.length > 0 && (
                <span className="inline-flex rounded-full border border-blue-700 bg-blue-800 px-3 py-1 text-xs font-medium text-blue-100">
                  {item.industries[0]}
                </span>
              )}
              <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{item.title}</h1>
              {item.clientName && <p className="mt-2 text-blue-100">{item.clientName}</p>}
            </div>
          )}

          {item.description && <p className="text-lg leading-relaxed text-gray-600">{item.description}</p>}

          {item.metrics && Object.keys(item.metrics).length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {Object.entries(item.metrics).map(([key, val]) => (
                <div key={key} className="min-w-[120px] flex-1 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{val}</div>
                  <Badge variant="success" className="mt-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {item.challenge && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('caseStudies.detail.challenge')}</h2>
              <p className="text-gray-600 leading-relaxed">{item.challenge}</p>
            </section>
          )}

          {item.solution && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('caseStudies.detail.solution')}</h2>
              <p className="text-gray-600 leading-relaxed">{item.solution}</p>
            </section>
          )}

          {item.results && (
            <Alert variant="info" title={t('caseStudies.detail.results')} className="mt-10">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-900" aria-hidden="true" />
                <p>{item.results}</p>
              </div>
            </Alert>
          )}

          {item.clientQuote && (
            <blockquote className="mt-10 rounded-lg border border-gray-200 bg-white p-6">
              <Quote className="mb-3 h-8 w-8 text-blue-200" aria-hidden="true" />
              <p className="text-lg italic leading-relaxed text-gray-700">&ldquo;{item.clientQuote}&rdquo;</p>
              {item.clientName && (
                <footer className="mt-4 text-sm font-medium text-gray-900">— {item.clientName}</footer>
              )}
            </blockquote>
          )}

          <div className="mt-12 flex flex-wrap gap-4">
            <Button href={localePath('/contact', locale)} size="lg">
              {t('common.scheduleDemo')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button href={localePath('/case-studies', locale)} size="lg" variant="outline">
              {t('caseStudies.detail.more')}
            </Button>
          </div>
          <PageEndCta />
      </PublicPageShell>
    </>
  );
}
