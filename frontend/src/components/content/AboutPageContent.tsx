'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { TeamSpotlight } from '@/components/layout/TeamSpotlight';
import { getApiUrl } from '@/lib/api';
import type { TeamMember } from '@/types';

interface AboutContent {
  story?: string;
  mission?: string;
  vision?: string;
  values?: { title: string; description: string }[];
  achievements?: string[];
}

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

export function AboutPageContent() {
  const [about, setAbout] = useState<AboutContent>({});
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [settingsRes, teamRes] = await Promise.all([
          fetch(getApiUrl('/settings'), { cache: 'no-store' }),
          fetch(getApiUrl('/team'), { cache: 'no-store' }),
        ]);

        if (cancelled) return;

        if (settingsRes.ok) {
          const json = await settingsRes.json();
          setAbout(parseAboutContent(json.data?.aboutContent));
        } else {
          setError(true);
        }

        if (teamRes.ok) {
          const json = await teamRes.json();
          setTeam(Array.isArray(json.data) ? json.data : []);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-16" aria-busy="true" aria-label="Memuat konten">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mx-auto h-10 w-64 animate-pulse rounded-lg bg-gray-200" />
            <div className="mx-auto mt-4 h-20 max-w-3xl animate-pulse rounded-lg bg-gray-100" />
          </div>
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="h-40 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
            <div className="h-40 animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Tentang DN Tech</h1>
          {about.story && (
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">{about.story}</p>
          )}
          {error && !about.mission && !about.vision && (
            <p className="mt-4 text-sm text-gray-500">Konten sedang dimuat. Muat ulang halaman jika masih kosong.</p>
          )}
        </div>

        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-xl font-semibold text-blue-900">Misi Kami</h2>
            <p className="text-gray-600">{about.mission}</p>
          </Card>
          <Card>
            <h2 className="mb-3 text-xl font-semibold text-blue-900">Visi Kami</h2>
            <p className="text-gray-600">{about.vision}</p>
          </Card>
        </div>

        {about.values && about.values.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Nilai-Nilai Kami</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {about.values.map((v) => (
                <Card key={v.title}>
                  <h3 className="font-semibold text-gray-900">{v.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{v.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {about.achievements && about.achievements.length > 0 && (
          <div className="mb-16 rounded-2xl bg-blue-900 p-8">
            <h2 className="mb-8 text-center text-2xl font-bold text-white">Pencapaian</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {about.achievements.map((a) => (
                <div key={a} className="text-center text-white">
                  <div className="text-lg font-semibold">{a}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <TeamSpotlight members={team} />
      </div>
    </div>
  );
}
