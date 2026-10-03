'use client';

import { useCallback, useEffect, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Link } from '@/i18n/navigation';
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

const LAUNCH_STATUS_KEYS = ['launched', 'in_progress', 'planned'] as const;

interface ProductCatalogProps {
  initialProducts: Product[];
  category?: string;
  search?: string;
}

export function ProductCatalog({ initialProducts, category, search }: ProductCatalogProps) {
  const t = useTranslations('catalog');
  const format = useFormatter();
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

  const formatPrice = (amount: number) =>
    format.number(amount, { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  const launchStatusLabel = (status?: string | null) =>
    LAUNCH_STATUS_KEYS.includes(status as (typeof LAUNCH_STATUS_KEYS)[number])
      ? t(`products.launchStatus.${status}`)
      : t('products.launchStatus.default');

  return (
    <>
      {categories.length > 0 && (
        <nav className="mb-10 flex flex-wrap gap-x-6 gap-y-3 border-b border-slate-200" aria-label={t('products.filterAria')}>
          <Link href="/products" className={`border-b-2 pb-3 text-sm font-semibold ${!category ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>{t('common.all')}</Link>
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
          <span>{t('products.loading')}</span>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const teasers = featureTeasers(product.features);
            const price = cheapestPrice(product);
            const status = launchStatusLabel(product.launchStatus);
            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group flex min-h-[330px] flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{product.category}</span>
                    <span className="text-xs font-semibold text-slate-500">{status}</span>
                  </div>
                  <div>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">{product.name}</h2>
                    {product.tagline && <p className="mt-1 text-sm font-medium text-slate-500">{product.tagline}</p>}
                  </div>
                  <div className="mt-5 flex-1">
                    <p className="text-sm leading-6 text-slate-600">{product.description}</p>
                    {teasers.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {teasers.map((title, index) => <li key={index} className="text-sm text-slate-600">— {title}</li>)}
                      </ul>
                    )}
                  </div>
                  <div className="mt-6 flex items-end justify-between gap-3 border-t border-slate-200 pt-4">
                    <div>
                      {product.featured && <span className="block text-xs font-bold text-amber-700">{t('products.featuredBadge')}</span>}
                      {price != null && (
                        <p className="mt-1 text-sm font-bold text-slate-950">
                          {t('products.priceFrom', { price: price === 0 ? t('products.free') : formatPrice(price) })}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-900">
                      {t('common.viewDetail')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <p>{error ? t('products.loadError') : t('products.empty')}</p>
          {error && (
            <button type="button" onClick={() => void loadProducts()} className="mt-3 font-medium text-blue-900 hover:underline">
              {t('products.retry')}
            </button>
          )}
        </div>
      )}
    </>
  );
}
