import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import { Button } from '@/components/ui/Button';
import { DEFAULT_PRODUCTS_SECTION } from '@/lib/homepage-content';
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

function ProductMark({ name, onDark }: { name: string; onDark?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={
        onDark
          ? 'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--secondary)] text-sm font-bold text-white'
          : 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--primary)] text-sm font-bold text-white'
      }
    >
      {productMark(name)}
    </span>
  );
}

export function HomeProducts({
  products,
  title = DEFAULT_PRODUCTS_SECTION.title,
  subtitle = DEFAULT_PRODUCTS_SECTION.subtitle,
}: HomeProductsProps) {
  const { featured, rest } = pickHomepageProducts(products);
  if (!featured) return null;

  const featuredBody =
    featured.tagline && featured.description && featured.description !== featured.tagline
      ? featured.description
      : null;
  const featuredStatus = formatProductStatusBadge(featured.customerCount);

  return (
    <section className="bg-white py-section" aria-label={title}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={title} subtitle={subtitle} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6 lg:items-stretch">
          <Link
            href={`/products/${featured.slug}`}
            className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 lg:col-span-7"
          >
            <article className="flex h-full flex-col border-l-[6px] border-[var(--secondary)] bg-[var(--primary)] p-6 text-white sm:p-8 lg:p-10">
              <div className="flex items-start gap-4">
                <ProductMark name={featured.name} onDark />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {featured.featured && (
                      <p className="text-xs font-semibold uppercase tracking-wide text-teal-200">
                        Unggulan
                      </p>
                    )}
                    {featuredStatus && (
                      <span className="rounded-sm bg-white/15 px-2 py-0.5 text-xs font-medium text-blue-100">
                        {featuredStatus}
                      </span>
                    )}
                  </div>
                  {featured.category && (
                    <span className="mt-2 inline-block w-fit rounded-sm bg-white/15 px-2 py-0.5 text-xs font-medium text-white">
                      {featured.category}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{featured.name}</h3>
              {(featured.tagline || featured.description) && (
                <p className="mt-3 text-base font-medium leading-relaxed text-blue-50">
                  {featured.tagline || featured.description}
                </p>
              )}
              {featuredBody && (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-blue-100">
                  {featuredBody}
                </p>
              )}

              <span className="mt-8 inline-flex min-h-11 w-fit items-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[var(--primary)] group-hover:bg-blue-50">
                Lihat {featured.name} <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </span>
            </article>
          </Link>

          {rest.length > 0 && (
            <ul className="flex flex-col gap-3 lg:col-span-5">
              {rest.map((product) => (
                <li key={product.id} className={rest.length <= 3 ? 'flex min-h-0 flex-1' : ''}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex min-h-11 w-full items-center gap-4 rounded-lg border border-gray-200 bg-surface px-4 py-4 text-left transition-colors hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                  >
                    <ProductMark name={product.name} />
                    <span className="min-w-0 flex-1">
                      {product.category && (
                        <span className="block text-xs font-medium text-[var(--primary)]">
                          {product.category}
                        </span>
                      )}
                      <span className="block font-semibold text-gray-900">{product.name}</span>
                      {(product.tagline || product.description) && (
                        <span className="mt-0.5 block line-clamp-2 text-sm text-gray-600">
                          {product.tagline || product.description}
                        </span>
                      )}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-[var(--primary)]"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8">
          <Button href="/products" variant="outline">
            Semua produk
          </Button>
        </div>
      </div>
    </section>
  );
}
