import { Card } from '@/components/ui/Card';
import { TeamSpotlight } from '@/components/layout/TeamSpotlight';
import type { AboutContent } from '@/lib/about-content';
import type { TeamMember } from '@/types';

export type { AboutContent } from '@/lib/about-content';

interface AboutPageContentProps {
  about: AboutContent;
  team: TeamMember[];
}

export function AboutPageContent({ about, team }: AboutPageContentProps) {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Tentang DN Tech</h1>
          {about.story && (
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 whitespace-pre-line">{about.story}</p>
          )}
        </div>

        {(about.mission || about.vision) && (
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            {about.mission && (
              <Card>
                <h2 className="mb-3 text-xl font-semibold text-blue-900">Misi Kami</h2>
                <p className="text-gray-600">{about.mission}</p>
              </Card>
            )}
            {about.vision && (
              <Card>
                <h2 className="mb-3 text-xl font-semibold text-blue-900">Visi Kami</h2>
                <p className="text-gray-600">{about.vision}</p>
              </Card>
            )}
          </div>
        )}

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
