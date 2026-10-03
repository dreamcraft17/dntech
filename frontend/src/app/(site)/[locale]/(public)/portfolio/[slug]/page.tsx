import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchPublicApiSafe } from '@/lib/server-api';
import { buildMetadata, localePath } from '@/lib/seo';
import type { PortfolioItem } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';

type RouteParams = Promise<{ locale: string; slug: string }>;

async function getItem(slug: string) {
  return fetchPublicApiSafe<PortfolioItem>(`/portfolio/${slug}`, 60);
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'catalog' });
  const item = await getItem(slug);
  if (!item) return { title: t('portfolio.metadataFallback') };
  return buildMetadata({
    title: item.seoTitle || item.title,
    description: item.seoDescription || item.description || '',
    path: `/portfolio/${slug}`,
    keywords: ['portfolio DN Tech', item.clientName || '', item.title].filter(Boolean),
    locale,
  });
}

export default async function PortfolioDetailPage({ params }: { params: RouteParams }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('catalog');
  const item = await getItem(slug);
  if (!item) notFound();

  return (
    <PublicPageShell width="4xl">
        <nav className="mb-8 text-sm text-gray-500" aria-label={t('breadcrumb.aria')}>
          <Link href="/portfolio" className="text-blue-900 hover:underline">
            {t('breadcrumb.portfolio')}
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-gray-900">{item.title}</span>
        </nav>

        {item.featuredImage?.url ? (
          <div className="relative mb-8 h-64 overflow-hidden rounded-lg">
            <Image
              src={item.featuredImage.url}
              alt={item.featuredImage.altText || item.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        ) : (
          <div className="mb-8 flex h-64 items-center justify-center rounded-lg bg-blue-900/10">
            <FolderOpen className="h-16 w-16 text-blue-900" aria-hidden="true" />
          </div>
        )}

        <h1 className="text-4xl font-bold text-gray-900">{item.title}</h1>
        <p className="mt-2 text-lg text-gray-500">{t('portfolio.detail.client', { name: item.clientName ?? '' })}</p>

        <div className="prose mt-8 max-w-none">
          <h2>{t('portfolio.detail.summary')}</h2>
          <p>{item.description}</p>

          {item.outcomes && (
            <>
              <h2>{t('portfolio.detail.outcomes')}</h2>
              <p>{item.outcomes}</p>
            </>
          )}

          {item.testimonial && (
            <blockquote className="my-6 border-l-4 border-blue-900 pl-4 italic text-gray-600">
              &ldquo;{item.testimonial}&rdquo;
            </blockquote>
          )}
        </div>

        <div className="mt-10">
          <Button href={localePath('/contact', locale)}>{t('portfolio.detail.cta')}</Button>
        </div>
        <PageEndCta />
    </PublicPageShell>
  );
}
