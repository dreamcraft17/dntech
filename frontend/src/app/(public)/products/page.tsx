import Link from 'next/link';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Product } from '@/types';
import type { Metadata } from 'next';
import { ProductCatalog } from './ProductCatalog';

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

      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-slate-200 pb-14 text-slate-900">
            <div className="max-w-3xl border-l-2 border-teal-600 pl-6 sm:pl-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Produk DN Tech</p>
              <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Software untuk pekerjaan yang harus selesai.</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
                Kami membuat produk untuk pekerjaan operasional yang sering berantakan: mengurus orang, angka, dan proses harian. Lihat dulu produk, harga, batasan, dan statusnya sebelum memutuskan.
              </p>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-teal-600" />Jelas siapa yang cocok</span>
                <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-teal-600" />Harga dan status terlihat</span>
                <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-teal-600" />Ada tim yang bisa dihubungi</span>
              </div>
            </div>
          </div>

          <div className="mb-10 mt-14 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Katalog</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Pilih yang paling dekat dengan pekerjaan Anda</h2>
            </div>
            <p className="hidden max-w-sm text-right text-sm text-slate-500 md:block">Setiap produk punya detail use case, harga, batasan, dan cara mulai.</p>
          </div>

          <ProductCatalog initialProducts={products} category={params.category} search={params.search} />

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">Tidak menemukan yang pas di katalog?</p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link href="/services" className="text-blue-900 font-medium hover:underline">Lihat Layanan Kami</Link>
              <Link href="/blog" className="text-blue-900 font-medium hover:underline">Baca Panduan Kami</Link>
              <Link href="/contact" className="text-blue-900 font-medium hover:underline">Hubungi Kami</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
