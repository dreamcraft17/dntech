import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { TeamMember } from '@/types';
import type { Career } from '@/types';

interface HomeTeamProps {
  members: TeamMember[];
  careers: Career[];
  hiringRoles: string[];
  hiringEmail: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function HomeTeam({ members, careers, hiringRoles, hiringEmail }: HomeTeamProps) {
  const openRoles = careers.length > 0 ? careers.slice(0, 3).map((c) => c.title) : hiringRoles;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Siapa yang Handle Project Anda"
          subtitle="Tim berpengalaman — founder terlibat langsung di project penting"
        />

        {members.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.slice(0, 4).map((member) => (
              <Card key={member.id} className="h-full">
                <div className="flex items-start gap-4">
                  {member.photo?.url ? (
                    <Image
                      src={member.photo.url}
                      alt={member.photo.altText || member.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-900 text-lg font-bold text-white">
                      {getInitials(member.name)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm font-medium text-teal-600">{member.role}</p>
                    {member.bio && (
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-4">
                        {member.bio}
                      </p>
                    )}
                    {member.socialLinks?.linkedin && (
                      <a
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-sm text-blue-900 hover:underline"
                      >
                        <span className="font-bold text-xs">in</span> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mx-auto max-w-xl">
            <h3 className="font-semibold text-gray-900">Dozer Napitupulu</h3>
            <p className="text-sm font-medium text-teal-600">Founder & Tech Lead</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              15+ tahun develop software. Langsung involved di project strategy & code review.
            </p>
          </Card>
        )}

        <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-900">Kami Sedang Hiring</h3>
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            {openRoles.map((role) => (
              <li key={role}>· {role}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-4">
            <a
              href={`mailto:${hiringEmail}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-900 hover:underline"
            >
              <Mail className="h-4 w-4" />
              {hiringEmail}
            </a>
            <Link href="/careers" className="text-sm font-medium text-blue-900 hover:underline">
              Lihat lowongan →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
