import { ArrowRight, CheckCircle, Languages } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
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
import { DetailSection } from '@/components/layout/DetailSection';

type RouteParams = Promise<{ locale: string; slug: string }>;

type LocalizedService = Service & LocalizedContentMeta;

async function getService(slug: string, locale: string) {
  return fetchPublicApiSafe<LocalizedService>(withLocale(`/services/${slug}`, locale), 60);
}

/**
 * Builds hreflang from the service's per-language slugs (`slugs`) instead of
 * assuming every locale shares one slug — mirrors blog/[slug]'s pruneAlternates.
 */
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

export default async function ServiceDetailPage({ params }: { params: RouteParams }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('catalog');
  const [service, settings, faqs] = await Promise.all([
    getService(slug, locale),
    getPublicSettings(),
    getFaqs(),
  ]);
  if (!service) notFound();

  const servedLocale = service.locale || locale;

  const features = (service.features as { title: string; description?: string }[]) || [];
  const relatedPosts = service.category ? await getRelatedPosts(service.category, locale) : [];
  const calendlyUrl = settings.calendlyUrl;

  const internalLinks = [
    { href: localePath('/contact', locale), label: t('common.freeConsultation') },
    { href: localePath('/faq', locale), label: t('common.faq') },
    ...relatedPosts.map((p) => ({ href: localePath(`/blog/${p.slug}`, locale), label: p.title })),
  ];

  const servicesUrl = `${SITE_URL}${localePath('/services', locale)}`;

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

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3" lang={service.isFallback ? servedLocale : undefined}>
            <div className="lg:col-span-2">
              <DetailPageHeader
                kicker={service.category || t('services.kicker')}
                title={service.name}
                description={service.description}
                actions={
                  <>
                    <Button href={`${localePath('/contact', locale)}?service=${encodeURIComponent(service.slug)}`}>
                      {t('services.detail.ctaPrimary')}
                    </Button>
                    <Button href="#process" variant="outline">
                      {t('services.detail.ctaSecondary')}
                    </Button>
                  </>
                }
              />

              {features.length > 0 && (
                <DetailSection title={t('services.detail.included')}>
                  <div className="saas-card-grid sm:grid-cols-2">
                    {features.map((feature, i) => (
                      <SaasPanel key={i} className="flex gap-3 !p-4">
                        <CheckCircle className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{feature.title}</div>
                          {feature.description && (
                            <div className="text-sm text-gray-600 mt-1">{feature.description}</div>
                          )}
                        </div>
                      </SaasPanel>
                    ))}
                  </div>
                </DetailSection>
              )}

              <DetailSection title={t('services.detail.process')} className="scroll-mt-24" >
                <div id="process" className="space-y-4">
                  {SERVICE_PROCESS_STEPS.map((step) => (
                    <SaasPanel key={step.step} className="flex gap-4 !p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-blue-900 bg-blue-900 font-bold text-white">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{t(`services.process.${step.key}.title`)}</h3>
                        <p className="text-sm text-gray-600 mt-1">{t(`services.process.${step.key}.description`)}</p>
                      </div>
                    </SaasPanel>
                  ))}
                </div>
              </DetailSection>

              {faqs.length > 0 && (
                <DetailSection title={t('services.detail.faq')}>
                  <div className="space-y-3">
                    {faqs.map((faq) => (
                      <SaasPanel key={faq.id} className="group !p-0 overflow-hidden">
                      <details className="p-4">
                        <summary className="font-medium text-gray-900 cursor-pointer list-none flex justify-between items-center">
                          {faq.question}
                          <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
                        </summary>
                        <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                      </details>
                      </SaasPanel>
                    ))}
                  </div>
                </DetailSection>
              )}

              {relatedPosts.length > 0 && (
                <DetailSection title={t('services.detail.relatedArticles')}>
                  <div className="space-y-3">
                    {relatedPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="saas-panel block rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-3 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:border-[var(--border-strong)]"
                      >
                        {post.title}
                      </Link>
                    ))}
                  </div>
                </DetailSection>
              )}
            </div>

            <div>
              <SaasPanel className="sticky top-24 border-t-4 border-blue-900">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                  {t('services.detail.nextStepKicker')}
                </p>
                <h3 className="mt-2 font-semibold text-slate-950">{t('services.detail.nextStepTitle')}</h3>
                <p className="mb-6 mt-3 text-sm leading-6 text-slate-600">{t('services.detail.nextStepBody')}</p>
                <Button href={`${localePath('/contact', locale)}?service=${encodeURIComponent(service.slug)}`} className="w-full">
                  {t('common.freeConsultation')}
                </Button>
              </SaasPanel>

              {service.relatedServices && service.relatedServices.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">{t('services.detail.relatedServices')}</h3>
                  <div className="space-y-3">
                    {service.relatedServices.map((related) => (
                      <Link key={related.id} href={`/services/${related.slug}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <span className="text-sm font-medium text-gray-900">{related.name}</span>
                        <ArrowRight className="h-4 w-4 text-blue-900" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 hidden lg:block">
                <InternalLinks title={t('common.learnMore')} links={internalLinks.slice(0, 5)} />
              </div>
            </div>
          </div>

          <div className="mt-16">
            <CalendlyEmbed url={calendlyUrl} />
          </div>
          <PageEndCta />
      </PublicPageShell>
    </>
  );
}
