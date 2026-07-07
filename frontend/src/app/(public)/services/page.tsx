import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Service } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Services' };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getServices(searchParams: { category?: string; search?: string }) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.search) params.set('search', searchParams.search);
  try {
    const res = await fetch(`${API_URL}/services?${params}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()).data as Service[];
  } catch {
    return [];
  }
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const services = await getServices(params);
  const categories = [...new Set(services.map((s) => s.category).filter(Boolean))];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900">Our Services</h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Comprehensive technology solutions tailored to your business needs
          </p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <Link href="/services" className="px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white">
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/services?category=${encodeURIComponent(cat!)}`}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  params.category === cat ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-600 hover:border-blue-600'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link key={service.id} href={`/services/${service.slug}`}>
              <Card hover className="h-full">
                <div className="text-xs text-blue-600 font-medium mb-2">{service.category}</div>
                <h2 className="text-xl font-semibold text-slate-900">{service.name}</h2>
                <p className="mt-3 text-slate-600 line-clamp-3">{service.description}</p>
                {service.features && Array.isArray(service.features) && (
                  <ul className="mt-4 space-y-1">
                    {(service.features as { title: string }[]).slice(0, 3).map((f, i) => (
                      <li key={i} className="text-sm text-slate-500 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        {f.title}
                      </li>
                    ))}
                  </ul>
                )}
                <span className="mt-4 inline-flex items-center text-sm text-blue-600 font-medium">
                  View details <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              </Card>
            </Link>
          ))}
        </div>

        {services.length === 0 && (
          <p className="text-center text-slate-500 py-12">No services found.</p>
        )}
      </div>
    </div>
  );
}
