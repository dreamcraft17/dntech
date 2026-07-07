import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import type { TeamMember } from '@/types';
import type { Metadata } from 'next';
import { Globe, Share2 } from 'lucide-react';

export const metadata: Metadata = { title: 'Our Team' };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getTeam() {
  try {
    const res = await fetch(`${API_URL}/team`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()).data as TeamMember[];
  } catch {
    return [];
  }
}

export default async function TeamPage() {
  const team = await getTeam();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900">Meet Our Team</h1>
          <p className="mt-4 text-slate-600">The talented people behind DN Tech</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <Card key={member.id} className="text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                {member.name.charAt(0)}
              </div>
              <h2 className="font-semibold text-slate-900">{member.name}</h2>
              <p className="text-sm text-blue-600 mt-1">{member.role}</p>
              {member.department && <p className="text-xs text-slate-500 mt-1">{member.department}</p>}
              {member.bio && <p className="mt-3 text-sm text-slate-600">{member.bio}</p>}
              {member.socialLinks && Object.keys(member.socialLinks).length > 0 && (
                <div className="mt-4 flex justify-center gap-2">
                  {Object.entries(member.socialLinks).map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors" title={platform}>
                      {platform === 'linkedin' || platform === 'github' ? (
                        <Globe className="h-4 w-4 text-slate-600" />
                      ) : (
                        <Share2 className="h-4 w-4 text-slate-600" />
                      )}
                    </a>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
