import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';
import { formatCurrencyIDR } from '@/lib/utils';
import type { Product, ProductFeatureGroup, ProductFeatureItem } from '@/types';
import type { Metadata } from 'next';
import { getApiBaseUrl } from '@/lib/api';

function featureTeasers(features?: ProductFeatureItem[] | ProductFeatureGroup[]): string[] {
  if (!features || !features.length) return [];
  const first = features[0] as ProductFeatureGroup;
  if (first.category && first.features) {
    return first.features.slice(0, 3).map((f) => f.name || f.title || '');
  }
  return (features as ProductFeatureItem[]).slice(0, 3).map((f) => f.title || f.name || '');
}

function cheapestPrice(product: Product): number | null {
  const amounts = (product.pricingTiers || [])
    .map((t) => t.pricing?.amount)
    .filter((a): a is number => typeof a === 'number');
  return amounts.length ? Math.min(...amounts) : null;
}

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.products.title,
  description: PAGE_SEO.products.description,
  path: '/products',
  keywords: PAGE_SEO.products.keywords,
});

const API_URL = getApiBaseUrl();

async function getProducts(searchParams: { category?: string; search?: string }) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.search) params.set('search', searchParams.search);
  try {
    const res = await fetch(`${API_URL}/products?${params}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()).data as Product[];
  } catch (error) {
    console.error('[products] Failed to load public products', { apiUrl: API_URL, error });
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
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

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

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              <Link href="/products" className="px-4 py-2 rounded-full text-sm font-medium bg-blue-900 text-white">Semua</Link>
              {categories.map((cat) => (
                <Link key={cat} href={`/products?category=${encodeURIComponent(cat!)}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    params.category === cat ? 'bg-blue-900 text-white border-blue-900' : 'border-gray-300 text-gray-600'
                  }`}>{cat}</Link>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const teasers = featureTeasers(product.features);
              const price = cheapestPrice(product);
              return (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Card hover className="h-full">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs text-blue-900 font-medium">{product.category}</span>
                      {product.featured && <span className="text-xs font-semibold text-amber-600">★ Unggulan</span>}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
                    {product.tagline && <p className="mt-1 text-sm text-gray-500">{product.tagline}</p>}
                    <p className="mt-3 text-gray-600 line-clamp-3">{product.description}</p>
                    {teasers.length > 0 && (
                      <ul className="mt-4 space-y-1">
                        {teasers.map((title, i) => (
                          <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                            {title}
                          </li>
                        ))}
                      </ul>
                    )}
                    {price != null && (
                      <p className="mt-4 text-sm font-semibold text-gray-900">
                        Mulai dari {price === 0 ? 'Gratis' : formatCurrencyIDR(price)}
                      </p>
                    )}
                    <span className="mt-2 inline-flex items-center text-sm text-blue-900 font-medium">
                      Lihat detail <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>

          {products.length === 0 && (
            <p className="text-center text-gray-500 py-12">Tidak ada produk ditemukan.</p>
          )}

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
