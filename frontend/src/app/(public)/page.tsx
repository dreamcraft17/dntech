import { Suspense } from 'react';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import { getPublicSettings } from '@/lib/settings';
import { resolveHomeContent } from '@/lib/homepage-content';
import type { Metadata } from 'next';
import { HomeHero } from '@/components/homepage/HomeHero';
import { HomeBelowFold, HomeBelowFoldFallback } from '@/components/homepage/HomeBelowFold';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.home.title,
  description: PAGE_SEO.home.description,
  path: '/',
  keywords: PAGE_SEO.home.keywords,
});

export default async function HomePage() {
  const settings = await getPublicSettings();
  const content = resolveHomeContent(settings);

  return (
    <>
      <HomeHero content={content} />
      <Suspense fallback={<HomeBelowFoldFallback />}>
        <HomeBelowFold content={content} settings={settings} />
      </Suspense>
    </>
  );
}
