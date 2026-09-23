import Link from 'next/link';
import { PortfolioCard } from '@/components/cards/PortfolioCard';
import { Badge } from '@/components/ui/Badge';
import { fetchPublicApiList } from '@/lib/server-api';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import type { PortfolioItem } from '@/types';
import type { Metadata } from 'next';
import { PageIntro } from '@/components/layout/PageIntro';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.portfolio.title,
  description: PAGE_SEO.portfolio.description,
  path: '/portfolio',
  keywords: PAGE_SEO.portfolio.keywords,
});

async function getPortfolio() {
  return fetchPublicApiList<PortfolioItem>('/portfolio?pageSize=12', 60);
}

export default async function PortfolioPage() {
  const items = await getPortfolio();
  const industries = [...new Set(items.flatMap((i) => (i.industries as string[]) || []))];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-l-2 border-teal-600 pl-4">
          <p className="text-sm text-blue-800">
            Mencari kisah sukses detail dengan metrik dan testimoni klien?{' '}
            <Link href="/case-studies" className="font-semibold text-blue-900 hover:underline">
              Lihat Studi Kasus →
            </Link>
          </p>
        </div>

        <PageIntro
          kicker="Pekerjaan terpilih"
          title="Portofolio"
          description={items.length > 0
            ? 'Proyek yang kami izinkan tampil publik.'
            : 'Belum ada item portofolio publik. Lihat produk first-party di halaman Produk.'}
        />

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
          <div className="border-y border-slate-300 py-16">
            <p className="text-gray-600 max-w-md mx-auto">
              Item portofolio akan muncul setelah proyek klien selesai dan klien memberi izin publikasi.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-lg border-2 border-teal-600 px-5 py-2.5 text-sm font-semibold text-teal-600 hover:bg-teal-50 min-h-[44px]"
              >
                Lihat Produk Kami
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 min-h-[44px]"
              >
                Konsultasi Gratis
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
