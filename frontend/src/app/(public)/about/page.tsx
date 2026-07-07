import { Card } from '@/components/ui/Card';
import { TeamSpotlight } from '@/components/layout/TeamSpotlight';
import type { TeamMember, SiteSettings } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About Us' };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getAboutData() {
  try {
    const [settingsRes, teamRes] = await Promise.all([
      fetch(`${API_URL}/settings`, { next: { revalidate: 300 } }),
      fetch(`${API_URL}/team`, { next: { revalidate: 60 } }),
    ]);
    const settings = settingsRes.ok ? (await settingsRes.json()).data as SiteSettings : {};
    const team = teamRes.ok ? (await teamRes.json()).data as TeamMember[] : [];
    return { settings, team };
  } catch {
    return { settings: {}, team: [] };
  }
}

export default async function AboutPage() {
  const { settings, team } = await getAboutData();
  const about = settings.aboutContent || {};

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900">About DN Tech</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">{about.story}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card>
            <h2 className="text-xl font-semibold text-blue-600 mb-3">Our Mission</h2>
            <p className="text-slate-600">{about.mission}</p>
          </Card>
          <Card>
            <h2 className="text-xl font-semibold text-blue-600 mb-3">Our Vision</h2>
            <p className="text-slate-600">{about.vision}</p>
          </Card>
        </div>

        {about.values && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Our Values</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(about.values as { title: string; description: string }[]).map((v) => (
                <Card key={v.title}>
                  <h3 className="font-semibold text-slate-900">{v.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{v.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {about.achievements && (
          <div className="bg-blue-600 rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Achievements</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(about.achievements as string[]).map((a) => (
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
