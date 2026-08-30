import Link from 'next/link';
import { TeamSpotlight } from '@/components/layout/TeamSpotlight';
import { hasAboutCopy, type AboutContent } from '@/lib/about-content';
import { cn } from '@/lib/utils';
import type { TeamMember } from '@/types';

export type { AboutContent } from '@/lib/about-content';

interface AboutPageContentProps {
  about: AboutContent;
  team: TeamMember[];
}

export function AboutPageContent({ about, team }: AboutPageContentProps) {
  const hasCopy = hasAboutCopy(about);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Tentang DN Tech</h1>
          {about.story && (
            <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 whitespace-pre-line">{about.story}</p>
          )}
          {!hasCopy && (
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Profil studio belum ter-load. Lihat produk first-party di{' '}
              <Link href="/products" className="font-medium text-blue-900 underline">
                halaman Produk
              </Link>
              .
            </p>
          )}
        </div>

        {(about.mission || about.vision) && (
          <div className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-8">
            {about.mission && (
              <div className={cn('lg:col-span-3', !about.vision && 'lg:col-span-5')}>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-600">Misi Kami</h2>
                <p className="mt-3 border-l-4 border-blue-900 pl-6 text-2xl font-medium leading-snug text-gray-900">
                  {about.mission}
                </p>
              </div>
            )}
            {about.vision && (
              <div
                className={cn(
                  'rounded-lg bg-gray-50 p-6 lg:col-span-2',
                  !about.mission && 'lg:col-span-5 bg-transparent p-0'
                )}
              >
                <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-600">Visi Kami</h2>
                <p className="mt-3 text-gray-600">{about.vision}</p>
              </div>
            )}
          </div>
        )}

        {about.values && about.values.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">Nilai-Nilai Kami</h2>
            <div className="border-t border-gray-200">
              {about.values.map((v, index) => (
                <div
                  key={`${v.title}-${index}`}
                  className={cn(
                    'flex flex-col gap-3 border-b border-gray-200 py-7 sm:flex-row sm:items-start sm:gap-8',
                    index % 2 === 1 && 'sm:flex-row-reverse'
                  )}
                >
                  <span
                    className="shrink-0 text-4xl font-bold text-gray-200 sm:w-16 sm:text-5xl"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="sm:flex-1">
                    <h3 className="font-semibold text-gray-900">{v.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{v.description}</p>
                  </div>
                </div>
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
