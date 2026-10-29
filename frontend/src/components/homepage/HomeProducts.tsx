import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import { Button } from '@/components/ui/Button';
import { formatProductStatusBadge } from '@/lib/product-status';
import type { Product } from '@/types';

interface HomeProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export function pickHomepageProducts(products: Product[]) {
  if (!products.length) {
    return { featured: undefined, rest: [] as Product[] };
  }
  const featured = products.find((product) => product.featured) ?? products[0];
  const rest = products.filter((product) => product.id !== featured.id).slice(0, 5);
  return { featured, rest };
}

export function productMark(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  const stripped = name.replace(/^dn/i, '');
  if (stripped !== name && stripped[0]) {
    return `D${stripped[0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function productStatusLabel(product: Product): string | null {
  return formatProductStatusBadge(product.launchStatus || product.customerCount);
}

function ProductMark({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className="hp-v5-mark">
      {productMark(name)}
    </span>
  );
}

export function HomeProducts({ products, title, subtitle }: HomeProductsProps) {
  const t = useTranslations('home.products');
  const tDefaults = useTranslations('home.defaults');
  const sectionTitle = title ?? tDefaults('productsTitle');
  const sectionSubtitle = subtitle ?? tDefaults('productsSubtitle');
  const { featured, rest } = pickHomepageProducts(products);
  if (!featured) return null;

  const featuredBody =
    featured.tagline && featured.description && featured.description !== featured.tagline
      ? featured.description
      : null;
  const featuredStatus = productStatusLabel(featured);

  const featuredInner = (
    <>
      <div className="flex items-start gap-4">
        <ProductMark name={featured.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {featured.featured && (
              <span className="text-xs font-bold uppercase tracking-wide text-[var(--secondary)]">
                {t('featuredBadge')}
              </span>
            )}
            {featuredStatus && (
              <span className="rounded-[var(--radius-card)] bg-[var(--surface-inset)] px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                {featuredStatus}
              </span>
            )}
          </div>
          {featured.category && (
            <span className="mt-2 inline-block rounded-[var(--radius-card)] bg-[var(--surface-inset)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
              {featured.category}
            </span>
          )}
        </div>
      </div>
      <h3 className="dn-display mt-6 text-3xl sm:text-4xl">{featured.name}</h3>
      {(featured.tagline || featured.description) && (
        <p className="mt-3 text-base font-medium leading-relaxed text-[var(--foreground)]">
          {featured.tagline || featured.description}
        </p>
      )}
      {featuredBody && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">{featuredBody}</p>
      )}
      <span className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white">
        {t('viewProduct', { name: featured.name })} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </>
  );

  return (
    <section className="hp-v5-section" aria-label={sectionTitle}>
      <div className="hp-v5-container">
        <SectionHeading kicker={t('kicker')} title={sectionTitle} subtitle={sectionSubtitle} className="mb-8" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5 lg:items-stretch">
          <div className="lg:col-span-7">
            {featured.slug ? (
              <Link
                href={`/products/${featured.slug}`}
                className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                <article className="hp-v5-catalog-feature flex h-full flex-col sm:p-8">{featuredInner}</article>
              </Link>
            ) : (
              <article className="hp-v5-catalog-feature flex h-full flex-col sm:p-8">{featuredInner}</article>
            )}
          </div>

          {rest.length > 0 && (
            <ul className="flex list-none flex-col gap-3 p-0 lg:col-span-5">
              {rest.map((product) => {
                const listStatus = productStatusLabel(product);
                return (
                  <li key={product.id} className={rest.length <= 3 ? 'flex min-h-0 flex-1' : ''}>
                    <Link href={`/products/${product.slug}`} className="hp-v5-catalog-row w-full">
                      <ProductMark name={product.name} />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          {product.category && (
                            <span className="text-xs font-medium text-[var(--primary)]">{product.category}</span>
                          )}
                          {listStatus && (
                            <span className="rounded-[var(--radius-card)] bg-[var(--surface-inset)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--primary)]">
                              {listStatus}
                            </span>
                          )}
                        </span>
                        <span className="block font-semibold text-[var(--foreground)]">{product.name}</span>
                        {(product.tagline || product.description) && (
                          <span className="mt-0.5 block line-clamp-2 text-sm text-[var(--muted)]">
                            {product.tagline || product.description}
                          </span>
                        )}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-8">
          <Button href="/products" variant="outline">
            {t('viewAll')}
          </Button>
        </div>
      </div>
    </section>
  );
}
