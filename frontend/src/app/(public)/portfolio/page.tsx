import Link from 'next/link';
import { PortfolioCard } from '@/components/cards/PortfolioCard';
import { Badge } from '@/components/ui/Badge';
import { fetchPublicApiList } from '@/lib/server-api';
import type { PortfolioItem } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Portofolio' };

async function getPortfolio() {
  return fetchPublicApiList<PortfolioItem>('/portfolio?pageSize=12', 60);
}

export default async function PortfolioPage() {
  const items = await getPortfolio();
  const industries = [...new Set(items.flatMap((i) => (i.industries as string[]) || []))];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg border border-blue-100 bg-blue-50 p-4 text-center">
          <p className="text-sm text-blue-800">
            Mencari kisah sukses detail dengan metrik dan testimoni klien?{' '}
            <Link href="/case-studies" className="font-semibold text-blue-900 hover:underline">
              Lihat Studi Kasus →
            </Link>
          </p>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Portofolio Kami</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Menampilkan proyek sukses dan transformasi klien
          </p>
        </div>

        {industries.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {industries.map((ind) => (
              <Badge key={ind} variant="default">
                {ind}
              </Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>

        {items.length === 0 && (
          <p className="py-12 text-center text-gray-500">Belum ada item portofolio.</p>
        )}
      </div>
    </div>
  );
}
