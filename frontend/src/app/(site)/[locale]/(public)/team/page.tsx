import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card } from '@/components/ui/Card';
import { JsonLd, breadcrumbSchema, personSchema } from '@/components/seo/JsonLd';
import { buildMetadata, getPageSeo, localePath, SITE_URL } from '@/lib/seo';
import { fetchPublicApiList } from '@/lib/server-api';
import type { TeamMember } from '@/types';
import type { Metadata } from 'next';
import { Globe } from 'lucide-react';
import { getUploadUrl } from '@/lib/api';
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
  const seo = getPageSeo('team', locale);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: '/team',
    keywords: seo.keywords,
    locale,
  });
}

async function getTeam() {
  return fetchPublicApiList<TeamMember>('/team', 60);
}

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [team, t] = await Promise.all([
    getTeam(),
    getTranslations({ locale, namespace: 'pages' }),
  ]);
  const teamUrl = `${SITE_URL}${localePath('/team', locale)}`;

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: t('breadcrumbHome'), url: `${SITE_URL}${localePath('/', locale)}` },
        { name: t('team.breadcrumb'), url: teamUrl },
      ])} />
      {team.map((member) => (
        <JsonLd
          key={member.id}
          data={personSchema({
            name: member.name,
            role: member.role,
            bio: member.bio,
            url: teamUrl,
            image: member.photo?.url ? getUploadUrl(member.photo.url) : undefined,
            sameAs: member.socialLinks ? Object.values(member.socialLinks).filter(Boolean) : undefined,
          })}
        />
      ))}

      <PublicPageShell>
          <PageIntro kicker={t('team.kicker')} title={t('team.title')} description={t('team.description')} />

          {team.length === 0 ? (
            <SaasEmptyState
              description={t('team.empty')}
              actions={<Button href="/contact">{t('team.emptyAction')}</Button>}
            />
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {team.map((member) => {
                const isSingle = team.length === 1;
                return (
                <Card
                  key={member.id}
                  className={
                    isSingle
                      ? 'text-center w-full sm:w-96 p-8'
                      : 'text-center w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]'
                  }
                >
                  {member.photo?.url ? (
                    <Image
                      src={getUploadUrl(member.photo.url)}
                      alt={member.photo.altText || member.name}
                      width={isSingle ? 144 : 96}
                      height={isSingle ? 144 : 96}
                      quality={80}
                      sizes={isSingle ? '144px' : '96px'}
                      className={
                        isSingle
                          ? 'h-36 w-36 rounded-full object-cover mx-auto mb-5 border border-gray-200'
                          : 'h-24 w-24 rounded-full object-cover mx-auto mb-4 border border-gray-200'
                      }
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className={
                        isSingle
                          ? 'h-36 w-36 rounded-full bg-blue-900 mx-auto mb-5 flex items-center justify-center text-white text-4xl font-bold'
                          : 'h-24 w-24 rounded-full bg-blue-900 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold'
                      }
                    >
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <h2 className={isSingle ? 'text-xl font-semibold text-gray-900' : 'font-semibold text-gray-900'}>{member.name}</h2>
                  <p className="text-sm text-teal-600 mt-1">{member.role}</p>
                  {member.bio && <p className="mt-3 text-sm text-gray-600">{member.bio}</p>}
                  {member.socialLinks && Object.keys(member.socialLinks).length > 0 && (
                    <div className="mt-4 flex justify-center gap-2">
                      {Object.entries(member.socialLinks).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-md bg-gray-100 hover:bg-blue-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label={t('team.socialAria', { name: member.name, platform })}
                        >
                          <Globe className="h-4 w-4 text-gray-600" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  )}
                </Card>
              );})}
            </div>
          )}
          <PageEndCta />
      </PublicPageShell>
    </>
  );
}
