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

      <div className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-teal-50 px-6 py-12 text-slate-900 shadow-sm sm:px-10 lg:px-14">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-teal-300/25 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-blue-200/20 blur-3xl" aria-hidden="true" />
            <div className="relative max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Produk DN Tech</p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Software yang lahir dari workflow nyata.</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
                Pilih produk berdasarkan masalah yang ingin Anda bereskan—bukan daftar fitur yang panjang. Setiap halaman menjelaskan siapa yang cocok, apa yang tersedia, dan langkah berikutnya.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm text-slate-700">
                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5">Outcome-led</span>
                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5">Status rilis transparan</span>
                <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5">Dibuat untuk operasi Indonesia</span>
              </div>
            </div>
          </div>

          <div className="mb-10 mt-12 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Katalog</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Cari produk yang paling relevan</h2>
            </div>
            <p className="hidden max-w-sm text-right text-sm text-slate-500 md:block">Buka detail untuk melihat use case, pricing, FAQ, dan CTA yang sesuai.</p>
          </div>

          <ProductCatalog initialProducts={products} category={params.category} search={params.search} />

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">Butuh produk yang disesuaikan kebutuhan bisnis Anda?</p>
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
