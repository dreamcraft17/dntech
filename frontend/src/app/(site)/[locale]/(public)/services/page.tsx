import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageIntro } from '@/components/layout/PageIntro';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { buildMetadata, getPageSeo, localePath, SITE_URL } from '@/lib/seo';
import { fetchPublicApiList } from '@/lib/server-api';
import { withLocale } from '@/lib/api';
import type { Service } from '@/types';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo('services', locale);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: '/services',
    keywords: seo.keywords,
    locale,
  });
}

async function getServices(searchParams: { category?: string; search?: string }, locale: string) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.search) params.set('search', searchParams.search);
  return fetchPublicApiList<Service>(withLocale(`/services?${params}`, locale), 60);
}

export default async function ServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('catalog');
  const query = await searchParams;
  const services = await getServices(query, locale);
  const categories = [...new Set(services.map((s) => s.category).filter(Boolean))];
  const base = `${SITE_URL}${localePath('/services', locale)}`;

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: t('breadcrumb.home'), url: `${SITE_URL}${localePath('/', locale)}` },
        { name: t('breadcrumb.services'), url: base },
      ])} />
      {services.length > 0 && (
        <JsonLd data={itemListSchema(services.map((s) => ({
          name: s.name,
          url: `${base}/${s.slug}`,
        })))} />
      )}

      <PublicPageShell>
          <PageIntro
            kicker={t('services.kicker')}
            title={t('services.title')}
            description={t('services.description')}
          />

          {categories.length > 0 && (
            <nav className="mb-10 mt-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-slate-200" aria-label={t('services.filterAria')}>
              <Link href="/services" className={`border-b-2 pb-3 text-sm font-semibold ${!query.category ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>{t('common.all')}</Link>
              {categories.map((cat) => (
                <Link key={cat} href={`/services?category=${encodeURIComponent(cat!)}`}
                  className={`border-b-2 pb-3 text-sm font-semibold ${
                    query.category === cat ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-900'
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
                  {t('common.viewDetail')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          {services.length === 0 && (
            <p className="border-y border-slate-300 py-12 text-slate-500">{t('services.empty')}</p>
          )}

          <PageEndCta />
      </PublicPageShell>
    </>
  );
}
