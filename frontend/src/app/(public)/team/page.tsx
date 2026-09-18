import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { JsonLd, breadcrumbSchema, personSchema } from '@/components/seo/JsonLd';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';
import { fetchPublicApiList } from '@/lib/server-api';
import type { TeamMember } from '@/types';
import type { Metadata } from 'next';
import { Globe } from 'lucide-react';
import { getUploadUrl } from '@/lib/api';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.team.title,
  description: PAGE_SEO.team.description,
  path: '/team',
  keywords: PAGE_SEO.team.keywords,
});

async function getTeam() {
  return fetchPublicApiList<TeamMember>('/team', 60);
}

export default async function TeamPage() {
  const team = await getTeam();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Beranda', url: SITE_URL },
        { name: 'Tim', url: `${SITE_URL}/team` },
      ])} />
      {team.map((member) => (
        <JsonLd
          key={member.id}
          data={personSchema({
            name: member.name,
            role: member.role,
            bio: member.bio,
            url: `${SITE_URL}/team`,
            image: member.photo?.url ? getUploadUrl(member.photo.url) : undefined,
            sameAs: member.socialLinks ? Object.values(member.socialLinks).filter(Boolean) : undefined,
          })}
        />
      ))}

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">Kenalan dengan Tim Kami</h1>
            <p className="mt-4 text-gray-600">Orang-orang di balik DN Tech</p>
          </div>

          {team.length === 0 ? (
            <div className="text-center py-16 rounded-lg border border-dashed border-gray-200 bg-gray-50">
              <p className="text-gray-600">Profil tim akan segera ditambahkan.</p>
              <Link href="/contact" className="inline-block mt-4 text-blue-900 font-medium hover:underline">
                Hubungi kami
              </Link>
            </div>
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
                          aria-label={`${member.name} di ${platform}`}
                        >
                          <Globe className="h-4 w-4 text-gray-600" />
                        </a>
                      ))}
                    </div>
                  )}
                </Card>
              );})}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
