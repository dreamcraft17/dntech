import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Globe, Share2 } from 'lucide-react';
import type { TeamMember } from '@/types';

interface TeamSpotlightProps {
  members: TeamMember[];
  limit?: number;
}

export function TeamSpotlight({ members, limit = 4 }: TeamSpotlightProps) {
  const team = members.slice(0, limit);
  if (!team.length) return null;

  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Meet the Team</h2>
          <p className="mt-1 text-sm text-slate-600">Experts driving your digital transformation</p>
        </div>
        <Link href="/team" className="text-blue-600 text-sm font-medium hover:underline">View all</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member) => (
          <Card key={member.id} className="text-center group hover:border-blue-200 transition-colors">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all">
              {member.name.charAt(0)}
            </div>
            <h3 className="font-semibold text-slate-900">{member.name}</h3>
            <p className="text-sm text-blue-600 mt-0.5">{member.role}</p>
            {member.department && <p className="text-xs text-slate-500 mt-1">{member.department}</p>}
            {member.bio && <p className="mt-2 text-xs text-slate-600 line-clamp-2">{member.bio}</p>}
            {member.socialLinks && Object.keys(member.socialLinks).length > 0 && (
              <div className="mt-4 flex justify-center gap-2">
                {Object.entries(member.socialLinks).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-md bg-slate-100 hover:bg-blue-100 transition-colors" title={platform}>
                    {platform === 'linkedin' || platform === 'github' ? (
                      <Globe className="h-3.5 w-3.5 text-slate-600" />
                    ) : (
                      <Share2 className="h-3.5 w-3.5 text-slate-600" />
                    )}
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
