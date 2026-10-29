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
    <span aria-hidden="true" className="hp-v5-mark">
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

  const featuredInner = (
    <>
      <div className="flex items-start gap-4">
        <ServiceMark name={featured.name} />
        <div className="min-w-0 flex-1">
          {featured.category && (
            <span className="inline-block rounded-[var(--radius-card)] bg-[var(--surface-inset)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
              {featured.category}
            </span>
          )}
        </div>
      </div>
      <h3 className="dn-display mt-6 text-2xl sm:text-3xl">{featured.name}</h3>
      {featured.description && (
        <p className="mt-3 text-base leading-relaxed text-[var(--muted)]">{featured.description}</p>
      )}
      {featured.slug && (
        <span className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 border border-[var(--primary)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white">
          {t('viewService')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </>
  );

  return (
    <section className="hp-v5-section hp-v5-section--alt" aria-labelledby="services-heading">
      <div className="hp-v5-container">
        <SectionHeading
          kicker={t('kicker')}
          titleId="services-heading"
          title={t('title')}
          subtitle={t('subtitle')}
          className="mb-8"
        />

        <ul className="grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-12 lg:gap-5">
          <li className={rest.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
            {featured.slug ? (
              <Link
                href={`/services/${featured.slug}`}
                className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                <article className="hp-v5-catalog-feature flex h-full flex-col sm:p-8">{featuredInner}</article>
              </Link>
            ) : (
              <article className="hp-v5-catalog-feature flex h-full flex-col sm:p-8">{featuredInner}</article>
            )}
          </li>

          {rest.map((item) => (
            <li key={item.slug || item.name} className="lg:col-span-5">
              {item.slug ? (
                <Link href={`/services/${item.slug}`} className="hp-v5-catalog-row h-full">
                  <ServiceMark name={item.name} />
                  <span className="min-w-0 flex-1">
                    {item.category && (
                      <span className="block text-xs font-medium text-[var(--primary)]">{item.category}</span>
                    )}
                    <span className="block font-semibold text-[var(--foreground)]">{item.name}</span>
                    {item.description && (
                      <span className="mt-0.5 block line-clamp-2 text-sm text-[var(--muted)]">{item.description}</span>
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                </Link>
              ) : (
                <div className="hp-v5-catalog-row h-full">
                  <ServiceMark name={item.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[var(--foreground)]">{item.name}</span>
                    {item.description && (
                      <span className="mt-0.5 block text-sm text-[var(--muted)]">{item.description}</span>
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
