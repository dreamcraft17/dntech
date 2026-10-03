import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AboutPageContent } from '@/components/content/AboutPageContent';
import { DEFAULT_FOUNDER, parseAboutContent, resolveAboutContent } from '@/lib/about-content';
import { getBrandContent, getCoreValues } from '@/lib/branding';
import { buildMetadata, getPageSeo } from '@/lib/seo';
import { getPublicSettings } from '@/lib/settings';
import { fetchPublicApiList } from '@/lib/server-api';
import type { TeamMember } from '@/types';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo('about', locale);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: '/about',
    keywords: seo.keywords,
    locale,
  });
}

async function getTeam() {
  return fetchPublicApiList<TeamMember>('/team', 60);
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, team, brand, coreValues, t] = await Promise.all([
    getPublicSettings(),
    getTeam(),
    getBrandContent(),
    getCoreValues(),
    getTranslations({ locale, namespace: 'pages' }),
  ]);
  const about = resolveAboutContent(
    parseAboutContent(settings.aboutContent),
    brand,
    coreValues,
    { name: DEFAULT_FOUNDER.name, role: t('founder.role'), bio: t('founder.bio') },
  );

  return <AboutPageContent about={about} team={team} />;
}
