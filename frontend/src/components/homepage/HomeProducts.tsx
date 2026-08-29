import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { Product } from '@/types';

interface HomeProductsProps {
  products: Product[];
}

export function pickHomepageProducts(products: Product[]) {
  if (!products.length) {
    return { featured: undefined, rest: [] as Product[] };
  }
  const featured = products.find((product) => product.featured) ?? products[0];
  const rest = products.filter((product) => product.id !== featured.id).slice(0, 5);
  return { featured, rest };
}

export function HomeProducts({ products }: HomeProductsProps) {
  const { featured, rest } = pickHomepageProducts(products);
  if (!featured) return null;

  return (
    <section className="bg-white py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Produk first-party"
          subtitle="Produk yang kami operasikan sendiri. Buka halaman masing-masing untuk fitur dan status rilis."
        />

        <Link href={`/products/${featured.slug}`} className="block">
          <Card hover className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              {featured.featured && (
                <p className="text-xs font-semibold text-blue-900">Unggulan</p>
              )}
              {featured.category && (
                <span className="mt-2 inline-block w-fit rounded-sm bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-900">
                  {featured.category}
                </span>
              )}
              <h3 className="mt-2 text-2xl font-bold text-gray-900">{featured.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {featured.tagline || featured.description}
              </p>
            </div>
            <span className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-blue-900">
              Buka {featured.name} <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </span>
          </Card>
        </Link>

        {rest.length > 0 && (
          <ul className="mt-8 border-t border-gray-200">
            {rest.map((product) => (
              <li key={product.id} className="border-b border-gray-200">
                <Link
                  href={`/products/${product.slug}`}
                  className="flex min-h-11 items-center justify-between gap-4 py-3 text-left"
                >
                  <span>
                    <span className="font-medium text-gray-900">{product.name}</span>
                    {(product.tagline || product.category) && (
                      <span className="mt-0.5 block text-sm text-gray-600">
                        {product.tagline || product.category}
                      </span>
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-blue-900" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <Link href="/products" className="text-sm font-semibold text-blue-900 hover:underline">
            Semua produk
          </Link>
        </div>
      </div>
    </section>
  );
}
