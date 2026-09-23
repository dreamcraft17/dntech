'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LoaderCircle } from 'lucide-react';
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
        <nav className="mb-10 flex flex-wrap gap-x-6 gap-y-3 border-b border-slate-200" aria-label="Filter kategori produk">
          <Link href="/products" className={`border-b-2 pb-3 text-sm font-semibold ${!category ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>Semua</Link>
          {categories.map((item) => (
            <Link key={item} href={`/products?category=${encodeURIComponent(item!)}`}
              className={`border-b-2 pb-3 text-sm font-semibold ${
                category === item ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}>{item}</Link>
          ))}
        </nav>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-gray-500" role="status">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Memuat produk...</span>
        </div>
      ) : (
        <div className="border-t border-slate-300">
          {products.map((product) => {
            const teasers = featureTeasers(product.features);
            const price = cheapestPrice(product);
            const status = product.launchStatus === 'launched' ? 'Tersedia' : product.launchStatus === 'in_progress' ? 'Sedang divalidasi' : product.launchStatus === 'planned' ? 'Roadmap' : 'Produk aktif';
            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group grid gap-6 border-b border-slate-300 py-8 transition-colors hover:bg-slate-50 sm:px-3 lg:grid-cols-[0.75fr_1.2fr_0.65fr]">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{product.category}</span>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{product.name}</h2>
                    {product.tagline && <p className="mt-1 text-sm font-medium text-slate-500">{product.tagline}</p>}
                  </div>
                  <div>
                    <p className="text-sm leading-6 text-slate-600">{product.description}</p>
                    {teasers.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {teasers.map((title, index) => <li key={index} className="text-sm text-slate-600">— {title}</li>)}
                      </ul>
                    )}
                  </div>
                  <div className="flex flex-col items-start lg:items-end lg:text-right">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{status}</span>
                    {product.featured && <span className="mt-1 text-xs font-bold text-amber-700">Produk pilihan</span>}
                    {price != null && <p className="mt-4 text-sm font-bold text-slate-950">Mulai dari {price === 0 ? 'Gratis' : formatCurrencyIDR(price)}</p>}
                    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-blue-900">
                      Lihat detail <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
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
