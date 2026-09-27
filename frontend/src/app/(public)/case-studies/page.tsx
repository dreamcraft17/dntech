import { CaseStudyCard } from '@/components/cards/CaseStudyCard';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Metadata } from 'next';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';
import { SaasEmptyState } from '@/components/layout/SaasEmptyState';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO['case-studies'].title,
  description: PAGE_SEO['case-studies'].description,
  path: '/case-studies',
  keywords: PAGE_SEO['case-studies'].keywords,
});

interface CaseStudy {
  slug: string;
  title: string;
  description?: string;
  clientName?: string;
  metrics?: Record<string, string>;
  industries?: string[];
}

async function getCaseStudies() {
  return fetchPublicApiList<CaseStudy>('/case-studies?pageSize=50', 60);
}

export default async function CaseStudiesPage() {
  const items = await getCaseStudies();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Beranda', url: SITE_URL },
        { name: 'Studi Kasus', url: `${SITE_URL}/case-studies` },
      ])} />

      <PublicPageShell>
          <PageIntro
            kicker="Bukti kerja"
            title="Studi kasus"
            description={items.length > 0
              ? 'Studi kasus dipublikasikan hanya dengan izin klien.'
              : 'Belum ada studi kasus publik. Produk first-party kami ada di halaman Produk.'}
          />

          {items.length > 0 ? (
            <div className="saas-card-grid lg-3">
              {items.map((item) => (
                <CaseStudyCard
                  key={item.slug}
                  slug={item.slug}
                  title={item.title}
                  description={item.description}
                  clientName={item.clientName}
                  metrics={item.metrics}
                  industries={item.industries}
                />
              ))}
            </div>
          ) : (
            <SaasEmptyState
              description={
                <>
                  Studi kasus akan dipublikasikan setelah proyek nyata selesai dan klien memberikan izin.
                  <span className="mt-2 block text-gray-500">
                    Sementara itu, lihat produk first-party atau artikel blog kami.
                  </span>
                </>
              }
              actions={
                <>
                  <Button href="/products" variant="outline">
                    Lihat Produk
                  </Button>
                  <Button href="/blog">Baca Blog</Button>
                </>
              }
            />
          )}

          <PageEndCta />
      </PublicPageShell>
    </>
  );
}
