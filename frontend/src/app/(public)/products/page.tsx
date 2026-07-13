import Link from 'next/link';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';
import { fetchPublicApi } from '@/lib/server-api';
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
  try {
    return await fetchPublicApi<Product[]>(`/products?${params}`);
  } catch (error) {
    console.error('[products] Failed to load public products during SSR', error);
    return [];
  }
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

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">Produk Kami</h1>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Produk digital siap pakai untuk mempercepat operasional bisnis Anda
            </p>
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
