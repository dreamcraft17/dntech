import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { Product } from '@/types';

interface HomeProductsProps {
  products: Product[];
}

export function HomeProducts({ products }: HomeProductsProps) {
  if (!products.length) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Produk Kami"
          subtitle="Platform siap pakai dari DN Tech untuk mempercepat operasional bisnis Anda"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.slug} href={`/products/${product.slug}`}>
              <Card hover className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  {product.featured && (
                    <span className="shrink-0 text-xs font-semibold text-amber-600">★</span>
                  )}
                </div>
                {product.category && (
                  <span className="mt-2 inline-block w-fit rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-900">
                    {product.category}
                  </span>
                )}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">
                  {product.tagline || product.description}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-900">
                  Pelajari lebih lanjut <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/products" className="text-sm font-semibold text-blue-900 hover:underline">
            Lihat semua produk →
          </Link>
        </div>
      </div>
    </section>
  );
}
