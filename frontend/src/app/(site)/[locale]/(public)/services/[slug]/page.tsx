import { ArrowRight, CheckCircle, Languages } from 'lucide-react';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { JsonLd, breadcrumbSchema, serviceSchema, faqSchema } from '@/components/seo/JsonLd';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { CalendlyEmbed } from '@/components/interactive/CalendlyEmbed';
import { buildMetadata, localePath, SITE_URL } from '@/lib/seo';
import { SERVICE_PROCESS_STEPS } from '@/lib/service-process';
import { getPublicSettings } from '@/lib/settings';
import { serviceAlternates, withLocale } from '@/lib/api';
import type { LocalizedContentMeta } from '@/lib/api';
import { fetchPublicApiList, fetchPublicApiSafe } from '@/lib/server-api';
import type { Service, BlogPost, Faq } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';
import { PageBreadcrumb } from '@/components/layout/PageBreadcrumb';
import { DetailPageHeader } from '@/components/layout/DetailPageHeader';

type RouteParams = Promise<{ locale: string; slug: string }>;

type LocalizedService = Service & LocalizedContentMeta;

async function getService(slug: string, locale: string) {
  return fetchPublicApiSafe<LocalizedService>(withLocale(`/services/${slug}`, locale), 60);
}

function pruneAlternates(
  service: LocalizedService,
  locale: string,
  servedSlug: string,
): Metadata['alternates'] {
  const { canonical, languages } = serviceAlternates({
    locale,
    servedSlug,
    availableLocales: service.availableLocales,
    slugs: service.slugs,
  });
  return { canonical, languages };
}

async function getRelatedPosts(category: string, locale: string) {
  return fetchPublicApiList<BlogPost>(
    withLocale(`/blog?category=${encodeURIComponent(category)}&pageSize=3`, locale),
    60,
  );
}

async function getFaqs() {
  const faqs = await fetchPublicApiList<Faq>('/faq', 300);
  return faqs.slice(0, 6);
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'catalog' });
  const service = await getService(slug, locale);
  if (!service) return { title: t('services.metadataFallback') };
  return {
    ...buildMetadata({
      title: t('services.detail.titleSuffix', { title: service.seoTitle || service.name }),
      description: service.seoDescription || service.description,
      path: `/services/${slug}`,
      keywords: [service.category || '', service.name, 'software development Indonesia', 'Jakarta'].filter(Boolean),
      locale,
    }),
    alternates: pruneAlternates(service, locale, service.slug),
  };
}

function SectionNavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="whitespace-nowrap border-b-2 border-transparent py-1 font-medium text-slate-600 hover:border-[var(--primary)] hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
    >
      {label}
    </a>
  );
}

export default async function ServiceDetailPage({ params }: { params: RouteParams }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, format] = await Promise.all([getTranslations('catalog'), getFormatter()]);
  const [service, settings, faqs] = await Promise.all([
    getService(slug, locale),
    getPublicSettings(),
    getFaqs(),
  ]);
  if (!service) notFound();

  const servedLocale = service.locale || locale;

  const features = (service.features as { title: string; description?: string }[]) || [];
  const highlightFeatures = features.slice(0, 3);
  const relatedPosts = service.category ? await getRelatedPosts(service.category, locale) : [];
  const calendlyUrl = settings.calendlyUrl;

  const internalLinks = [
    { href: localePath('/contact', locale), label: t('common.freeConsultation') },
    { href: localePath('/faq', locale), label: t('common.faq') },
    ...relatedPosts.map((p) => ({ href: localePath(`/blog/${p.slug}`, locale), label: p.title })),
  ];

  const servicesUrl = `${SITE_URL}${localePath('/services', locale)}`;
  const contactHref = `${localePath('/contact', locale)}?service=${encodeURIComponent(service.slug)}`;
  const processStepCount = SERVICE_PROCESS_STEPS.length;

  const showNavIncluded = features.length > 0;
  const showNavFaq = faqs.length > 0;
  const showNavArticles = relatedPosts.length > 0;

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: t('breadcrumb.home'), url: `${SITE_URL}${localePath('/', locale)}` },
        { name: t('breadcrumb.services'), url: servicesUrl },
        { name: service.name, url: `${servicesUrl}/${slug}` },
      ])} />
      <JsonLd data={serviceSchema({
        name: service.name,
        description: service.description,
        slug,
        category: service.category,
      })} />
      {faqs.length > 0 && (
        <JsonLd data={faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })))} />
      )}

      <PublicPageShell>
        <PageBreadcrumb
          items={[
            { label: t('breadcrumb.home'), href: localePath('/', locale) },
            { label: t('breadcrumb.services'), href: localePath('/services', locale) },
            { label: service.name },
          ]}
        />

        {service.isFallback && (
          <div
            role="note"
            className="mb-8 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm leading-6 text-amber-900"
          >
            <Languages className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
            <p>
              <span className="font-semibold">{t('services.fallback.title')}</span>{' '}
              {t('services.fallback.body', { language: t(`services.fallback.language.${servedLocale}`) })}
            </p>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start" lang={service.isFallback ? servedLocale : undefined}>
          <DetailPageHeader
            kicker={service.category || t('services.kicker')}
            title={service.name}
            description={service.description}
            actions={
              <>
                <Button href={contactHref}>{t('services.detail.ctaPrimary')}</Button>
                <Button href="#process" variant="outline">
                  {t('services.detail.ctaSecondary')}
                </Button>
              </>
            }
          />

          <SaasPanel>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              {t('services.detail.summaryKicker')}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 border-b border-[var(--border)] pb-5">
              <div>
                <div className="text-2xl font-bold tabular-nums text-slate-950">
                  {t('services.detail.deliverableCount', { count: format.number(features.length) })}
                </div>
                <div className="mt-1 text-xs text-slate-500">{t('services.detail.deliverableLabel')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums text-slate-950">
                  {t('services.detail.processStepCount', { count: format.number(processStepCount) })}
                </div>
                <div className="mt-1 text-xs text-slate-500">{t('services.detail.processStepLabel')}</div>
              </div>
            </div>
            {highlightFeatures.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {highlightFeatures.map((feature, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                    <span>{feature.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm leading-6 text-slate-600">{service.description}</p>
            )}
          </SaasPanel>
        </div>

        <nav
          className="sticky top-16 z-10 -mx-4 mt-8 flex gap-6 overflow-x-auto border-y border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm sm:mx-0"
          aria-label={t('services.detail.sectionNavAria')}
        >
          {showNavIncluded && <SectionNavLink href="#included" label={t('services.detail.navIncluded')} />}
          <SectionNavLink href="#process" label={t('services.detail.navProcess')} />
          {showNavFaq && <SectionNavLink href="#faq" label={t('services.detail.navFaq')} />}
          {showNavArticles && <SectionNavLink href="#articles" label={t('services.detail.navArticles')} />}
          {calendlyUrl ? (
            <SectionNavLink href="#consult" label={t('common.freeConsultation')} />
          ) : null}
        </nav>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            {features.length > 0 && (
              <section id="included" className="scroll-mt-28">
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t('services.detail.included')}</h2>
                <div className="mt-6 border-t border-slate-300">
                  {features.map((feature, i) => (
                    <div key={i} className="flex gap-3 border-b border-slate-200 py-4">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                      <div>
                        <h3 className="font-medium text-slate-950">{feature.title}</h3>
                        {feature.description && (
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section id="process" className="scroll-mt-28 mt-16">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t('services.detail.process')}</h2>
              <ol className="relative mt-8 space-y-0 border-l border-slate-300 pl-6 sm:pl-8">
                {SERVICE_PROCESS_STEPS.map((step) => (
                  <li key={step.key} className="relative pb-10 last:pb-0">
                    <span
                      className="absolute -left-[1.65rem] flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white sm:-left-[1.85rem]"
                      aria-hidden="true"
                    >
                      {step.step}
                    </span>
                    <h3 className="font-semibold text-slate-950">{t(`services.process.${step.key}.title`)}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                      {t(`services.process.${step.key}.description`)}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            {faqs.length > 0 && (
              <section id="faq" className="scroll-mt-28 mt-16">
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t('services.detail.faq')}</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">{t('services.detail.faqHint')}</p>
                <div className="mt-6 max-w-2xl divide-y divide-slate-200 border-t border-slate-300">
                  {faqs.map((faq) => (
                    <details key={faq.id} className="group py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
                        {faq.question}
                        <span
                          className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                          aria-hidden="true"
                        >
                          ▼
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {relatedPosts.length > 0 && (
              <section id="articles" className="scroll-mt-28 mt-16">
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t('services.detail.relatedArticles')}</h2>
                <ul className="mt-6 border-t border-slate-300">
                  {relatedPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex items-center justify-between gap-3 border-b border-slate-200 py-4 text-sm font-medium text-slate-950 transition-colors hover:text-[var(--primary)]"
                      >
                        <span>{post.title}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <SaasPanel>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                {t('services.detail.nextStepKicker')}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">{t('services.detail.nextStepTitle')}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{t('services.detail.nextStepBody')}</p>
              <Button href={contactHref} className="mt-6 w-full">
                {t('common.freeConsultation')}
              </Button>
            </SaasPanel>

            {service.relatedServices && service.relatedServices.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-4 font-semibold text-slate-950">{t('services.detail.relatedServices')}</h3>
                <ul className="border-t border-slate-300">
                  {service.relatedServices.map((related) => (
                    <li key={related.id}>
                      <Link
                        href={`/services/${related.slug}`}
                        className="flex items-center justify-between gap-3 border-b border-slate-200 py-3 text-sm font-medium text-slate-950 transition-colors hover:text-[var(--primary)]"
                      >
                        <span>{related.name}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 hidden lg:block">
              <InternalLinks title={t('common.learnMore')} links={internalLinks.slice(0, 5)} />
            </div>
          </aside>
        </div>

        {calendlyUrl && (
          <section id="consult" className="scroll-mt-28 mx-auto mt-16 max-w-3xl">
            <CalendlyEmbed url={calendlyUrl} />
          </section>
        )}

        <PageEndCta />
      </PublicPageShell>
    </>
  );
}
