'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { apiFetch } from '@/lib/api';
import { formatCurrencyIDR } from '@/lib/utils';
import type { Product, ProductFeatureGroup, ProductFeatureItem } from '@/types';

function featureTeasers(features?: ProductFeatureItem[] | ProductFeatureGroup[]): string[] {
  if (!features?.length) return [];
  const first = features[0] as ProductFeatureGroup;
  if (first.category && first.features) {
    return first.features.slice(0, 3).map((feature) => feature.name || feature.title || '');
  }
  return (features as ProductFeatureItem[]).slice(0, 3).map((feature) => feature.title || feature.name || '');
}

function cheapestPrice(product: Product): number | null {
  const amounts = (product.pricingTiers || [])
    .map((tier) => tier.pricing?.amount)
    .filter((amount): amount is number => typeof amount === 'number');
  return amounts.length ? Math.min(...amounts) : null;
}

interface ProductCatalogProps {
  initialProducts: Product[];
  category?: string;
  search?: string;
}

export function ProductCatalog({ initialProducts, category, search }: ProductCatalogProps) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState(false);

  const requestProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);

    return apiFetch<Product[]>(`/products?${params}`);
  }, [category, search]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      setProducts(await requestProducts());
    } catch (loadError) {
      console.error('[products] Browser fallback failed', loadError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [requestProducts]);

  useEffect(() => {
    if (initialProducts.length > 0) return;
    let active = true;

    void requestProducts()
      .then((result) => {
        if (active) setProducts(result);
      })
      .catch((loadError) => {
        console.error('[products] Browser fallback failed', loadError);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialProducts.length, requestProducts]);

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];

  return (
    <>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <Link href="/products" className="px-4 py-2 rounded-full text-sm font-medium bg-blue-900 text-white">Semua</Link>
          {categories.map((item) => (
            <Link key={item} href={`/products?category=${encodeURIComponent(item!)}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${
                category === item ? 'bg-blue-900 text-white border-blue-900' : 'border-gray-300 text-gray-600'
              }`}>{item}</Link>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-gray-500" role="status">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Memuat produk...</span>
        </div>
      ) : (
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
                      {teasers.map((title, index) => (
                        <li key={index} className="text-sm text-gray-500 flex items-center gap-2">
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
      )}

      {!loading && products.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <p>{error ? 'Produk gagal dimuat.' : 'Tidak ada produk ditemukan.'}</p>
          {error && (
            <button type="button" onClick={() => void loadProducts()} className="mt-3 font-medium text-blue-900 hover:underline">
              Coba lagi
            </button>
          )}
        </div>
      )}
    </>
  );
}
