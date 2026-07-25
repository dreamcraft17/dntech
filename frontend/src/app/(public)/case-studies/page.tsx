import Link from 'next/link';
import { CaseStudyCard } from '@/components/cards/CaseStudyCard';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import { Button } from '@/components/ui/Button';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Metadata } from 'next';

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

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">Studi Kasus</h1>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Hasil nyata dari klien nyata. Lihat bagaimana kami membantu perusahaan bertransformasi dengan teknologi.
            </p>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="text-center py-16 rounded-lg border border-dashed border-gray-200 bg-gray-50">
              <p className="text-gray-600 max-w-md mx-auto">
                Studi kasus akan dipublikasikan setelah proyek nyata selesai dan klien memberikan izin.
              </p>
              <p className="mt-2 text-sm text-gray-500">Sementara itu, baca artikel blog kami untuk insight teknologi startup.</p>
              <Link href="/blog" className="inline-block mt-6 text-blue-900 font-medium hover:underline">Baca Blog</Link>
            </div>
          )}

          <div className="mt-16 text-center p-8 rounded-lg bg-blue-900">
            <h2 className="text-2xl font-bold text-white">Punya proyek yang ingin dikerjakan?</h2>
            <p className="mt-2 text-blue-100">Mari diskusikan kebutuhan teknologi Anda.</p>
            <Button href="/contact" size="lg" variant="inverse" className="mt-6">
              Konsultasi Gratis
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
