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
  const itemCount = String(items.length).padStart(2, '0');

  return (
    <section className="home-services-showcase py-section" aria-labelledby="services-heading">
      <div className="home-services-orbit home-services-orbit-one" data-depth="1" aria-hidden="true" />
      <div className="home-services-orbit home-services-orbit-two" data-depth="1" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(15rem,0.68fr)_minmax(0,1.32fr)] lg:gap-16 lg:px-8">
        <header className="home-services-intro" data-depth="4">
          <div className="flex items-end justify-between gap-4">
            <p className="home-services-kicker">
              <span className="h-px w-8 bg-[var(--accent)]" aria-hidden="true" />
              Layanan DN Tech
            </p>
            <span className="home-services-index" aria-hidden="true">01 / {itemCount}</span>
          </div>
          <h2 id="services-heading" className="mt-5 max-w-xl text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[3.25rem]">
            Butuh website, aplikasi, atau sistem internal?
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
            Mulai dari alur kerja yang bikin repot. Kami bantu menemukan bentuk software yang paling masuk akal untuk tim Anda.
          </p>
          <Link href="/services" className="home-services-all-link mt-8">
            Lihat seluruh layanan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="home-services-note" aria-hidden="true">Scope jelas · build seperlunya · siap dipakai</p>
        </header>

        <ul className="home-services-grid" data-depth="4">
          {items.map((item, index) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-5">
                  <span className="home-service-number" aria-hidden="true">0{index + 1}</span>
                  {index === 0 && <span className="home-service-badge">Pilihan utama</span>}
                </div>
                <div className="mt-auto">
                  {item.category && <p className="home-service-category">{item.category}</p>}
                  <h3 className="home-service-title">{item.name}</h3>
                  <p className="home-service-description">{item.description}</p>
                  {item.slug && (
                    <span className="home-service-action" aria-hidden="true">
                      Lihat layanan
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  )}
                </div>
              </>
            );

            return (
              <li key={item.slug || item.name} className={index === 0 ? 'home-service-item home-service-feature' : 'home-service-item'}>
                {item.slug ? (
                  <Link href={`/services/${item.slug}`} className="home-service-link group">
                    {content}
                  </Link>
                ) : (
                  <div className="home-service-link group">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
