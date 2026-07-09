import Link from 'next/link';
import { MapPin, Clock, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Career } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Karier' };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getCareers() {
  try {
    const res = await fetch(`${API_URL}/careers`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()).data as Career[];
  } catch {
    return [];
  }
}

export default async function CareersPage() {
  const careers = await getCareers();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Bergabung dengan Tim Kami</h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Bangun masa depan teknologi bersama kami. Jelajahi posisi terbuka di bawah ini.
          </p>
        </div>

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
            <p className="text-center text-gray-500 py-12">Tidak ada posisi terbuka saat ini. Periksa kembali nanti!</p>
          )}
        </div>
      </div>
    </div>
  );
}
