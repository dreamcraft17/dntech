import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageIntro } from '@/components/layout/PageIntro';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';
import { fetchPublicApiList } from '@/lib/server-api';
import type { Service } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.services.title,
  description: PAGE_SEO.services.description,
  path: '/services',
  keywords: PAGE_SEO.services.keywords,
});

async function getServices(searchParams: { category?: string; search?: string }) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.search) params.set('search', searchParams.search);
  return fetchPublicApiList<Service>(`/services?${params}`, 60);
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
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Beranda', url: SITE_URL },
        { name: 'Layanan', url: `${SITE_URL}/services` },
      ])} />
      {services.length > 0 && (
        <JsonLd data={itemListSchema(services.map((s) => ({
          name: s.name,
          url: `${SITE_URL}/services/${s.slug}`,
        })))} />
      )}

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageIntro
            kicker="Layanan"
            title="Dari website sampai sistem bisnis"
            description="Website company profile, aplikasi custom, dan integrasi sistem untuk bisnis yang ingin tampil meyakinkan dan bekerja lebih rapi."
          />

          {categories.length > 0 && (
            <nav className="mb-10 mt-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-slate-200" aria-label="Filter kategori layanan">
              <Link href="/services" className={`border-b-2 pb-3 text-sm font-semibold ${!params.category ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>Semua</Link>
              {categories.map((cat) => (
                <Link key={cat} href={`/services?category=${encodeURIComponent(cat!)}`}
                  className={`border-b-2 pb-3 text-sm font-semibold ${
                    params.category === cat ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}>{cat}</Link>
              ))}
            </nav>
          )}

          <div className="mt-10 border-t border-slate-300">
            {services.map((service) => (
              <Link key={service.id} href={`/services/${service.slug}`} className="group grid gap-6 border-b border-slate-300 py-8 transition-colors hover:bg-slate-50 sm:px-3 lg:grid-cols-[0.8fr_1.3fr_auto] lg:items-start">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{service.category}</div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">{service.name}</h2>
                </div>
                <div>
                  <p className="leading-7 text-slate-600">{service.description}</p>
                  {service.features && Array.isArray(service.features) && (
                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      {(service.features as { title: string }[]).slice(0, 3).map((f, i) => (
                        <li key={i} className="text-sm text-slate-500">— {f.title}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-900 lg:pt-7">
                  Lihat detail <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          {services.length === 0 && (
            <p className="border-y border-slate-300 py-12 text-slate-500">Tidak ada layanan ditemukan.</p>
          )}

          <div className="mt-16 border-l-2 border-teal-600 pl-5">
            <p className="mb-4 font-semibold text-slate-900">Belum yakin layanan mana yang sesuai?</p>
            <div className="flex flex-wrap gap-5 text-sm">
              <Link href="/quiz" className="text-blue-900 font-medium hover:underline">Ikuti Kuis Solusi</Link>
              <Link href="/blog" className="text-blue-900 font-medium hover:underline">Baca Panduan Kami</Link>
              <Link href="/contact" className="text-blue-900 font-medium hover:underline">Hubungi Kami</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
