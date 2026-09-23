import Link from 'next/link';
import { MapPin, Clock, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Career } from '@/types';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/layout/PageIntro';

export const metadata: Metadata = buildMetadata({
  title: 'Karier di DN Tech',
  description:
    'Temukan peluang karier di DN Tech dan kenali cara kami membangun aplikasi kustom, produk digital, serta software operasional untuk bisnis Indonesia.',
  path: '/careers',
});

async function getCareers() {
  return fetchPublicApiList<Career>('/careers', 60);
}

export default async function CareersPage() {
  const careers = await getCareers();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageIntro kicker="Karier" title="Bergabung dengan tim kami" description="Bangun masa depan teknologi bersama kami. Jelajahi posisi terbuka di bawah ini." />

        <div className="space-y-4 max-w-3xl mx-auto">
          {careers.map((job) => (
            <Card key={job.id} hover>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{job.title}</h2>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    {job.department && (
                      <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.department}</span>
                    )}
                    {job.location && (
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                    )}
                    {job.type && (
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{job.type}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                </div>
                <Link href={`/contact?subject=Karier: ${encodeURIComponent(job.title)}`}
                  className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors">
                  Lamar Sekarang
                </Link>
              </div>
            </Card>
          ))}

          {careers.length === 0 && (
            <div className="border-y border-slate-300 py-16">
              <p className="text-gray-600 max-w-md mx-auto">
                Belum ada posisi terbuka saat ini. Kami akan update halaman ini saat ada rekrutmen.
              </p>
              <Link
                href="/contact?subject=Karier"
                className="inline-flex mt-6 items-center justify-center rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 min-h-[44px]"
              >
                Kirim CV / Perkenalan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
