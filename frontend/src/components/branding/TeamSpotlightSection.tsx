'use client';

import { useEffect, useState } from 'react';
import type { TeamMember } from '@/types';
import { getApiUrl } from '@/lib/api';
import { TeamSpotlight } from '@/components/layout/TeamSpotlight';

export function TeamSpotlightSection() {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetch(getApiUrl('/branding/team'))
      .then((res) => res.json())
      .then((json) => {
        const mapped = Array.isArray(json.data)
          ? json.data.map((item: Record<string, unknown>) => ({
              id: String(item.id || ''),
              name: String(item.name || ''),
              role: String(item.role || ''),
              bio: String(item.bio || ''),
              photo: item.photoUrl ? { url: String(item.photoUrl), altText: String(item.name) } : undefined,
              socialLinks: {
                linkedin: String(item.linkedinUrl || ''),
                twitter: String(item.twitterUrl || ''),
              },
            }))
          : [];
        setTeam(mapped);
      })
      .catch(() => setTeam([]));
  }, []);

  if (!team.length) return null;

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <TeamSpotlight members={team} limit={5} />
      </div>
    </section>
  );
}
