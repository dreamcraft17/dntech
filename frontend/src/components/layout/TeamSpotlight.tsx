import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Globe } from 'lucide-react';
import type { TeamMember } from '@/types';
import { getUploadUrl } from '@/lib/api';

interface TeamSpotlightProps {
  members: TeamMember[];
  limit?: number;
}

export function TeamSpotlight({ members, limit = 4 }: TeamSpotlightProps) {
  const team = members.slice(0, limit);
  if (!team.length) return null;
  const isSingle = team.length === 1;

  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kenali Tim Kami</h2>
          <p className="mt-1 text-sm text-gray-600">Orang-orang di balik DN Tech</p>
        </div>
        <Link href="/team" className="text-blue-900 text-sm font-medium hover:underline">Lihat semua</Link>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        {team.map((member) => (
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
                width={isSingle ? 128 : 80}
                height={isSingle ? 128 : 80}
                quality={80}
                sizes={isSingle ? '128px' : '80px'}
                className={
                  isSingle
                    ? 'h-32 w-32 rounded-full object-cover mx-auto mb-5 border border-gray-200'
                    : 'h-20 w-20 rounded-full object-cover mx-auto mb-4 border border-gray-200'
                }
              />
            ) : (
              <div
                className={
                  isSingle
                    ? 'h-32 w-32 rounded-full bg-blue-900 mx-auto mb-5 flex items-center justify-center text-white text-4xl font-bold'
                    : 'h-20 w-20 rounded-full bg-blue-900 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold'
                }
              >
                {member.name.charAt(0)}
              </div>
            )}
            <h3 className={isSingle ? 'text-xl font-semibold text-gray-900' : 'font-semibold text-gray-900'}>{member.name}</h3>
            <p className={isSingle ? 'text-teal-600 mt-1' : 'text-sm text-teal-600 mt-0.5'}>{member.role}</p>
            {member.bio && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{member.bio}</p>}
            {member.socialLinks && Object.keys(member.socialLinks).length > 0 && (
              <div className="mt-4 flex justify-center gap-2">
                {Object.entries(member.socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-900 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`${member.name} di ${platform}`}
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
