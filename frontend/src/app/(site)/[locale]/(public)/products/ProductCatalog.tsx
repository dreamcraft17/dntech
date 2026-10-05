'use client';

import { useCallback, useEffect, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { ArrowRight, Check, LoaderCircle, Sparkles } from 'lucide-react';
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

function productMark(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  const stripped = name.replace(/^dn/i, '');
  if (stripped !== name && stripped[0]) return `D${stripped[0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
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

  const featured = products.find((product) => product.featured) ?? products[0];
  const supporting = featured ? products.filter((product) => product.id !== featured.id) : [];
  const featuredTeasers = featured ? featureTeasers(featured.features).slice(0, 3) : [];
  const featuredPrice = featured ? cheapestPrice(featured) : null;

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
        <div className="space-y-8">
          {featured && (
            <section className="grid overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1f4a] text-white shadow-xl lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]" aria-labelledby="featured-product-title">
              <Link
                href={`/products/${featured.slug}`}
                className="group relative flex min-h-[27rem] flex-col justify-between overflow-hidden p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset sm:p-10"
              >
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" data-depth="1" aria-hidden="true" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" data-depth="1" aria-hidden="true" />

                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>{t('products.featuredBadge')}</span>
                    {featured.category && <span className="text-blue-200">/ {featured.category}</span>}
                  </div>
                  <div className="mt-8 flex items-center gap-4">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-teal-500 text-lg font-bold text-white shadow-lg shadow-teal-950/20" aria-hidden="true">
                      {productMark(featured.name)}
                    </span>
                    <span className="text-sm font-semibold text-blue-100">{launchStatusLabel(featured.launchStatus)}</span>
                  </div>
                  <h2 id="featured-product-title" className="mt-7 max-w-xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                    {featured.name}
                  </h2>
                  {featured.tagline && <p className="mt-3 max-w-xl text-lg font-medium leading-7 text-blue-100">{featured.tagline}</p>}
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">{featured.description}</p>
                </div>

                <div className="relative z-10 mt-10 flex flex-wrap items-center gap-4 text-sm">
                  <span className="inline-flex min-h-11 items-center gap-2 bg-white px-5 py-2.5 font-semibold text-blue-950 transition-colors group-hover:bg-teal-50">
                    {t('common.viewDetail')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                  {featuredPrice != null && <span className="text-blue-100">{t('products.priceFrom', { price: featuredPrice === 0 ? t('products.free') : formatPrice(featuredPrice) })}</span>}
                </div>
              </Link>

              <div className="relative flex min-h-[27rem] flex-col justify-between border-t border-white/10 bg-[#102d65] p-6 sm:p-8 lg:border-l lg:border-t-0" data-depth="3">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                    <span>{t('products.proofKicker')}</span>
                    <span className="rounded-full border border-white/15 px-2 py-1 text-[10px]">{t('products.liveLabel')}</span>
                  </div>
                  <div className="mt-5 rounded-xl border border-white/10 bg-[#071938]/70 p-4 shadow-2xl shadow-blue-950/20">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-teal-300" aria-hidden="true" />
                        <span className="text-sm font-semibold text-white">{t('products.previewLabel')}</span>
                      </div>
                      <span className="text-xs text-blue-200">{t('products.liveLabel')}</span>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {['01', '02', '03'].map((item, index) => (
                        <div key={item} className="rounded-lg bg-white/5 p-3">
                          <span className="text-[10px] font-bold text-teal-200">{item}</span>
                          <span className="mt-4 block h-1.5 rounded-full bg-white/20"><span className={`block h-full rounded-full bg-teal-300 ${index === 0 ? 'w-4/5' : index === 1 ? 'w-3/5' : 'w-2/3'}`} /></span>
                          <span className="mt-2 block h-1 rounded-full bg-white/10" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg bg-teal-400/10 p-3 text-xs text-teal-100">
                      {t('products.proofNote')}
                    </div>
                  </div>
                </div>
                {featuredTeasers.length > 0 && (
                  <ul className="mt-8 space-y-3 text-sm text-blue-100">
                    {featuredTeasers.map((title) => (
                      <li key={title} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" aria-hidden="true" />
                        <span>{title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          {supporting.length > 0 && (
            <section aria-labelledby="product-index-title">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{t('products.indexKicker')}</p>
                  <h2 id="product-index-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{t('products.indexTitle')}</h2>
                </div>
                <span className="hidden text-sm text-slate-500 sm:block">{supporting.length} {t('products.indexCount')}</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {supporting.map((product, index) => {
                  const teasers = featureTeasers(product.features).slice(0, 2);
                  const price = cheapestPrice(product);
                  const status = launchStatusLabel(product.launchStatus);
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group grid min-h-[12rem] grid-cols-[auto_1fr_auto] gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 sm:p-6"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-900" aria-hidden="true">{productMark(product.name)}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          {product.category && <span className="text-slate-400">/ {product.category}</span>}
                        </div>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{product.name}</h3>
                        {product.tagline && <p className="mt-1 text-sm font-medium text-slate-500">{product.tagline}</p>}
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>
                        {teasers.length > 0 && <p className="mt-3 text-xs font-medium text-slate-500">{teasers.join(' · ')}</p>}
                      </div>
                      <div className="flex flex-col items-end justify-between gap-3 text-right">
                        <span className="text-xs font-semibold text-slate-500">{status}</span>
                        <div>
                          {price != null && <span className="block text-xs font-bold text-slate-900">{t('products.priceFrom', { price: price === 0 ? t('products.free') : formatPrice(price) })}</span>}
                          <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-blue-900">{t('common.viewDetail')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
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
