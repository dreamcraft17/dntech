import Link from 'next/link';
import { PortfolioCard } from '@/components/cards/PortfolioCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { fetchPublicApiList } from '@/lib/server-api';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import type { PortfolioItem } from '@/types';
import type { Metadata } from 'next';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';
import { SaasEmptyState } from '@/components/layout/SaasEmptyState';

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
    <PublicPageShell>
      <PageIntro
        kicker="Pekerjaan terpilih"
        title="Portofolio"
        description={
          items.length > 0
            ? 'Proyek yang kami izinkan tampil publik.'
            : 'Belum ada item portofolio publik. Lihat produk first-party di halaman Produk.'
        }
      >
        <p className="text-sm text-slate-600">
          Butuh metrik dan testimoni lebih detail?{' '}
          <Link href="/case-studies" className="font-semibold text-blue-900 hover:underline">
            Lihat studi kasus →
          </Link>
        </p>
      </PageIntro>

      {industries.length > 0 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {industries.map((ind) => (
            <Badge key={ind} variant="default">
              {ind}
            </Badge>
          ))}
        </div>
      )}

      {items.length > 0 ? (
        <div className="saas-card-grid lg-3">
          {items.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <SaasEmptyState
          description="Item portofolio akan muncul setelah proyek klien selesai dan klien memberi izin publikasi."
          actions={
            <>
              <Button href="/products" variant="outline">
                Lihat Produk
              </Button>
              <Button href="/contact">Konsultasi Gratis</Button>
            </>
          }
        />
      )}
      <PageEndCta />
    </PublicPageShell>
  );
}
