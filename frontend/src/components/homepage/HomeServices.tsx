import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { SectionHeading } from '@/components/homepage/SectionHeading';
import { Button } from '@/components/ui/Button';
import { productMark } from '@/components/homepage/HomeProducts';
import type { Service } from '@/types';
import type { HomeServiceCard } from '@/lib/homepage-content';

interface HomeServicesProps {
  services: Service[];
  defaults: HomeServiceCard[];
}

function ServiceMark({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--primary)] text-sm font-bold text-white"
    >
      {productMark(name)}
    </span>
  );
}

export function HomeServices({ services, defaults }: HomeServicesProps) {
  const t = useTranslations('home.services');
  const apiItems = services.slice(0, 4).map((s) => ({
    name: s.name,
    description: s.description,
    slug: s.slug,
    category: s.category,
  }));

  const items = (apiItems.length > 0 ? apiItems : defaults).slice(0, 4);
  if (items.length === 0) return null;

  const [featured, ...rest] = items;

  const featuredBody = (
    <>
      <div className="flex items-start gap-4">
        <ServiceMark name={featured.name} />
        <div className="min-w-0 flex-1">
          {featured.category && (
            <span className="inline-block rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {featured.category}
            </span>
          )}
        </div>
      </div>
      <h3 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{featured.name}</h3>
      {featured.description && (
        <p className="mt-3 text-base leading-relaxed text-slate-600">{featured.description}</p>
      )}
      {featured.slug && (
        <span className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-blue-800">
          {t('viewService')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </>
  );

  return (
    <section className="home-section py-section" aria-labelledby="services-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker={t('kicker')}
          titleId="services-heading"
          title={t('title')}
          subtitle={t('subtitle')}
          className="mb-8 md:mb-10"
        />

        <ul className="grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-12 lg:gap-6">
          <li className={rest.length > 0 ? 'lg:col-span-7 lg:row-span-3' : 'lg:col-span-12'}>
            {featured.slug ? (
              <Link
                href={`/services/${featured.slug}`}
                className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                <article className="flex h-full flex-col rounded-xl border border-[var(--border)] border-t-4 border-t-[var(--primary)] bg-white p-6 shadow-sm sm:p-8">
                  {featuredBody}
                </article>
              </Link>
            ) : (
              <article className="flex h-full flex-col rounded-xl border border-[var(--border)] border-t-4 border-t-[var(--primary)] bg-white p-6 shadow-sm sm:p-8">
                {featuredBody}
              </article>
            )}
          </li>

          {rest.map((item) => (
            <li key={item.slug || item.name} className="lg:col-span-5">
              {item.slug ? (
                <Link
                  href={`/services/${item.slug}`}
                  className="group flex min-h-11 h-full w-full items-center gap-4 rounded-lg border border-gray-200 bg-[var(--surface)] px-4 py-4 text-left transition-colors hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                >
                  <ServiceMark name={item.name} />
                  <span className="min-w-0 flex-1">
                    {item.category && (
                      <span className="block text-xs font-medium text-[var(--primary)]">
                        {item.category}
                      </span>
                    )}
                    <span className="block font-semibold text-gray-900">{item.name}</span>
                    {item.description && (
                      <span className="mt-0.5 block line-clamp-2 text-sm text-gray-600">
                        {item.description}
                      </span>
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                </Link>
              ) : (
                <div className="flex h-full w-full items-center gap-4 rounded-lg border border-gray-200 bg-[var(--surface)] px-4 py-4">
                  <ServiceMark name={item.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-gray-900">{item.name}</span>
                    {item.description && (
                      <span className="mt-0.5 block text-sm text-gray-600">{item.description}</span>
                    )}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Button href="/services" variant="outline">
            {t('viewAll')}
          </Button>
        </div>
      </div>
    </section>
  );
}
