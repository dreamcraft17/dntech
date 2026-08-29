import { AboutPageContent } from '@/components/content/AboutPageContent';
import { parseAboutContent, resolveAboutContent } from '@/lib/about-content';
import { getBrandContent, getCoreValues } from '@/lib/branding';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import { getPublicSettings } from '@/lib/settings';
import { fetchPublicApiList } from '@/lib/server-api';
import type { TeamMember } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.about.title,
  description: PAGE_SEO.about.description,
  path: '/about',
  keywords: PAGE_SEO.about.keywords,
});

async function getTeam() {
  return fetchPublicApiList<TeamMember>('/team', 60);
}

export default async function AboutPage() {
  const [settings, team, brand, coreValues] = await Promise.all([
    getPublicSettings(),
    getTeam(),
    getBrandContent(),
    getCoreValues(),
  ]);
  const about = resolveAboutContent(
    parseAboutContent(settings.aboutContent),
    brand,
    coreValues,
  );

  return <AboutPageContent about={about} team={team} />;
}
