import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Product } from '@/types';
import type { Metadata } from 'next';
import { ProductCatalog } from './ProductCatalog';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.products.title,
  description: PAGE_SEO.products.description,
  path: '/products',
  keywords: PAGE_SEO.products.keywords,
});

async function getProducts(searchParams: { category?: string; search?: string }) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.search) params.set('search', searchParams.search);
  return fetchPublicApiList<Product>(`/products?${params}`, 60);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const products = await getProducts(params);
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Beranda', url: SITE_URL },
        { name: 'Produk', url: `${SITE_URL}/products` },
      ])} />
      {products.length > 0 && (
        <JsonLd data={itemListSchema(products.map((p) => ({
          name: p.name,
          url: `${SITE_URL}/products/${p.slug}`,
        })))} />
      )}

      <PublicPageShell>
          <PageIntro
            kicker="Produk DN Tech"
            title="Software untuk pekerjaan yang harus selesai."
            description="Kami membuat produk untuk pekerjaan operasional yang sering berantakan: mengurus orang, angka, dan proses harian. Lihat dulu produk, harga, batasan, dan statusnya sebelum memutuskan."
          />

          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Katalog</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Pilih yang paling dekat dengan pekerjaan Anda</h2>
            </div>
            <p className="hidden max-w-sm text-right text-sm text-slate-500 md:block">Setiap produk punya detail use case, harga, batasan, dan cara mulai.</p>
          </div>

          <ProductCatalog initialProducts={products} category={params.category} search={params.search} />

          <PageEndCta />
      </PublicPageShell>
    </>
  );
}
