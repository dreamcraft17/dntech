import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { TeamSpotlight } from '@/components/layout/TeamSpotlight';
import { DEFAULT_FOUNDER, hasAboutCopy, resolveFounder, type AboutContent } from '@/lib/about-content';
import { cn } from '@/lib/utils';
import type { TeamMember } from '@/types';
import { PageIntro } from '@/components/layout/PageIntro';
import { PageEndCta } from '@/components/layout/PageEndCta';
import { PublicPageShell } from '@/components/layout/PublicPageShell';

export type { AboutContent } from '@/lib/about-content';

interface AboutPageContentProps {
  about: AboutContent;
  team: TeamMember[];
}

export function AboutPageContent({ about, team }: AboutPageContentProps) {
  const t = useTranslations('pages');
  const hasCopy = hasAboutCopy(about);
  const founder = resolveFounder(about.founder, {
    name: DEFAULT_FOUNDER.name,
    role: t('founder.role'),
    bio: t('founder.bio'),
  });

  return (
    <PublicPageShell>
        <PageIntro kicker={t('about.kicker')} title={t('about.title')} description={about.story || undefined}>
          {!hasCopy && (
            <p className="text-gray-600">
              {t.rich('about.empty', {
                link: (chunks) => (
                  <Link href="/products" className="font-medium text-blue-900 underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          )}
        </PageIntro>

        <section className="mb-16 border-t border-gray-200 pt-12" aria-labelledby="founded-by-heading">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
            <div className="lg:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">{t('about.foundedBy')}</p>
              <h2 id="founded-by-heading" className="mt-3 text-3xl font-bold text-gray-900">
                {founder.name}
              </h2>
              {founder.role && (
                <p className="mt-1 text-sm font-medium text-teal-600">{founder.role}</p>
              )}
            </div>
            {founder.bio && (
              <p className="lg:col-span-3 text-lg leading-relaxed text-gray-600 whitespace-pre-line">
                {founder.bio}
              </p>
            )}
          </div>
        </section>

        {(about.mission || about.vision) && (
          <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-8">
            {about.mission && (
              <div className={cn('lg:col-span-3', !about.vision && 'lg:col-span-5')}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-600">{t('about.missionHeading')}</h2>
                <p className="mt-3 border-l-4 border-blue-900 pl-6 text-2xl font-medium leading-snug text-gray-900">
                  {about.mission}
                </p>
              </div>
            )}
            {about.vision && (
              <div
                className={cn(
                  'border-l-2 border-teal-600 pl-6 lg:col-span-2',
                  !about.mission && 'lg:col-span-5'
                )}
              >
                <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-600">{t('about.visionHeading')}</h2>
                <p className="mt-3 text-gray-600">{about.vision}</p>
              </div>
            )}
          </div>
        )}

        {about.values && about.values.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">{t('about.valuesHeading')}</h2>
            <div className="border-t border-gray-200">
              {about.values.map((v) => (
                <div
                  key={v.title}
                  className="grid gap-3 border-b border-gray-200 py-7 sm:grid-cols-[minmax(12rem,0.7fr)_1fr] sm:gap-8"
                >
                  <h3 className="font-semibold text-gray-900">{v.title}</h3>
                  <p className="text-sm text-gray-600">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {about.achievements && about.achievements.length > 0 && (
          <div className="mb-16 border-y-2 border-blue-900 bg-blue-900 p-8">
            <h2 className="mb-8 text-2xl font-bold text-white">{t('about.achievementsHeading')}</h2>
            <div className="grid grid-cols-2 divide-x divide-white/20 lg:grid-cols-4">
              {about.achievements.map((a) => (
                <div key={a} className="text-center text-white">
                  <div className="text-lg font-semibold">{a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <TeamSpotlight members={team} />
        <PageEndCta />
    </PublicPageShell>
  );
}
