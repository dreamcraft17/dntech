import { AboutPageContent, type AboutContent } from '@/components/content/AboutPageContent';
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

function parseAboutContent(raw: unknown): AboutContent {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as AboutContent;
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') return raw as AboutContent;
  return {};
}

async function getTeam() {
  return fetchPublicApiList<TeamMember>('/team', 60);
}

export default async function AboutPage() {
  const [settings, team] = await Promise.all([getPublicSettings(), getTeam()]);
  const about = parseAboutContent(settings.aboutContent);

  return <AboutPageContent about={about} team={team} />;
}
