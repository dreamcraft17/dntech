import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Service } from '@/types';
import type { HomeServiceCard } from '@/lib/homepage-content';

interface HomeServicesProps {
  services: Service[];
  defaults: HomeServiceCard[];
}

export function HomeServices({ services, defaults }: HomeServicesProps) {
  const apiItems = services.slice(0, 4).map((s) => ({
    name: s.name,
    description: s.description,
    slug: s.slug,
    category: s.category,
  }));

  const items = (apiItems.length > 0 ? apiItems : defaults).slice(0, 4);

  return (
    <section className="border-y border-slate-200 bg-[#f3f5f7] py-section" aria-labelledby="services-heading">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20 lg:px-8">
        <header className="lg:sticky lg:top-28 lg:self-start">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
            <span className="h-px w-8 bg-[var(--accent)]" aria-hidden="true" />
            Layanan DN Tech
          </p>
          <h2
            id="services-heading"
            className="mt-4 max-w-lg text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem]"
          >
            Butuh website, aplikasi, atau sistem internal?
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
            Ceritakan alur kerja yang sedang bikin repot. Kami bantu menentukan apa yang perlu
            dibangun—dan apa yang belum perlu.
          </p>
          <Link
            href="/services"
            className="mt-8 inline-flex min-h-11 items-center gap-2 border-b-2 border-[var(--primary)] text-sm font-semibold text-[var(--primary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f3f5f7]"
          >
            Lihat seluruh layanan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        <ul className="border-t border-slate-300">
          {items.map((item, index) => {
            const content = (
              <>
                <div className="flex items-baseline gap-4">
                  <span
                    className="font-mono text-2xl font-bold leading-none text-slate-300 transition-colors duration-200 group-hover:text-[var(--accent)] sm:text-3xl"
                    aria-hidden="true"
                  >
                    0{index + 1}
                  </span>
                  <div>
                    {item.category && (
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--secondary)]">
                        {item.category}
                      </p>
                    )}
                    <h3 className="mt-1 text-lg font-semibold leading-snug text-slate-950 sm:text-xl">
                      {item.name}
                    </h3>
                  </div>
                </div>
                <p className="pl-[2.75rem] text-sm leading-6 text-slate-600 sm:text-[0.95rem] sm:leading-7 lg:pl-0">
                  {item.description}
                </p>
                {item.slug && (
                  <span
                    className="inline-flex items-center gap-2 self-start pl-[2.75rem] text-sm font-semibold text-[var(--primary)] lg:justify-self-end lg:pl-0"
                    aria-hidden="true"
                  >
                    Detail
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                )}
              </>
            );

            return (
              <li key={item.slug || item.name} className="border-b border-slate-300">
                {item.slug ? (
                  <Link
                    href={`/services/${item.slug}`}
                    className="group grid min-h-24 gap-3 border-l-2 border-transparent px-3 py-6 transition-colors hover:border-[var(--accent)] hover:bg-white focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)] sm:px-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] lg:items-start lg:gap-8 lg:py-7"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="group grid min-h-24 gap-3 px-3 py-6 sm:px-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-8 lg:py-7">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
