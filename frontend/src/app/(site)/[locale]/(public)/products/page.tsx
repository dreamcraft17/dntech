import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { buildMetadata, getPageSeo, localePath, SITE_URL } from '@/lib/seo';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Product } from '@/types';
import type { Metadata } from 'next';
import { ProductCatalog } from './ProductCatalog';
import { PageIntro } from '@/components/layout/PageIntro';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo('products', locale);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: '/products',
    keywords: seo.keywords,
    locale,
  });
}

async function getProducts(searchParams: { category?: string; search?: string }) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.search) params.set('search', searchParams.search);
  return fetchPublicApiList<Product>(`/products?${params}`, 60);
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('catalog');
  const query = await searchParams;
  const products = await getProducts(query);
  const base = `${SITE_URL}${localePath('/products', locale)}`;

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: t('breadcrumb.home'), url: `${SITE_URL}${localePath('/', locale)}` },
        { name: t('breadcrumb.products'), url: base },
      ])} />
      {products.length > 0 && (
        <JsonLd data={itemListSchema(products.map((p) => ({
          name: p.name,
          url: `${base}/${p.slug}`,
        })))} />
      )}

      <PublicPageShell>
          <PageIntro
            kicker={t('products.kicker')}
            title={t('products.title')}
            description={t('products.description')}
          />

          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">{t('products.catalogKicker')}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">{t('products.catalogTitle')}</h2>
            </div>
            <p className="hidden max-w-sm text-right text-sm text-slate-500 md:block">{t('products.catalogNote')}</p>
          </div>

          <ProductCatalog initialProducts={products} category={query.category} search={query.search} />

          <PageEndCta />
      </PublicPageShell>
    </>
  );
}
