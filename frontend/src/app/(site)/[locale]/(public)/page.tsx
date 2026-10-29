import { Suspense } from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { buildMetadata, getPageSeo } from '@/lib/seo';
import { getPublicSettings } from '@/lib/settings';
import { resolveHomeContent } from '@/lib/homepage-content';
import { HomeHero } from '@/components/homepage/HomeHero';
import { HomeJobPaths } from '@/components/homepage/HomeJobPaths';
import { HomeBelowFold, HomeBelowFoldFallback } from '@/components/homepage/HomeBelowFold';
import { HomeFaqJsonLd } from '@/components/seo/HomeFaqJsonLd';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo('home', locale);

  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: '/',
    keywords: seo.keywords,
    locale,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const settings = await getPublicSettings();
  const content = resolveHomeContent(settings, locale);

  return (
    <div className="homepage-v5">
      <HomeFaqJsonLd locale={locale} />
      <HomeHero content={content} />
      <HomeJobPaths />
      <Suspense fallback={<HomeBelowFoldFallback />}>
        <HomeBelowFold content={content} settings={settings} />
      </Suspense>
    </div>
  );
}
