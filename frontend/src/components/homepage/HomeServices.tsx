import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import type { Service } from '@/types';
import type { HomeServiceCard } from '@/lib/homepage-content';

interface HomeServicesProps {
  services: Service[];
  defaults: HomeServiceCard[];
}

export function HomeServices({ services, defaults }: HomeServicesProps) {
  const apiItems = services.slice(0, 6).map((s) => ({
    name: s.name,
    description: s.description,
    slug: s.slug,
  }));

  const items = apiItems.length > 0 ? apiItems : defaults;

  return (
    <section className="bg-surface py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Apa yang Kami Tawarkan"
          subtitle="Layanan pengembangan software dan konsultasi teknologi untuk startup & UMKM"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const inner = (
              <Card hover className="h-full">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
                {item.slug && (
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-900">
                    Pelajari lebih lanjut <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                )}
              </Card>
            );

            return item.slug ? (
              <Link key={item.slug} href={`/services/${item.slug}`}>
                {inner}
              </Link>
            ) : (
              <div key={item.name}>{inner}</div>
            );
          })}
        </div>
        <div className="mt-10">
          <Link
            href="/services"
            className="text-sm font-semibold text-blue-900 hover:underline"
          >
            Lihat semua layanan →
          </Link>
        </div>
      </div>
    </section>
  );
}
