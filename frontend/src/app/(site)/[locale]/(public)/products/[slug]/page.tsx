import { ArrowRight, CheckCircle } from 'lucide-react';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import { JsonLd, breadcrumbSchema, productSchema, faqSchema } from '@/components/seo/JsonLd';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { buildMetadata, localePath, SITE_URL } from '@/lib/seo';
import type { Product, ProductFeatureGroup, ProductFeatureItem, BlogPost, Faq } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { formatProductStatusBadge } from '@/lib/product-status';
import { fetchPublicApiList, fetchPublicApiSafe } from '@/lib/server-api';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';
import { PageBreadcrumb } from '@/components/layout/PageBreadcrumb';
import { DetailPageHeader } from '@/components/layout/DetailPageHeader';
import { PageEndCta } from '@/components/layout/PageEndCta';

type RouteParams = Promise<{ locale: string; slug: string }>;

async function getProduct(slug: string) {
  return fetchPublicApiSafe<Product>(`/products/${slug}`, 60);
}

async function getRelatedPosts(category: string) {
  return fetchPublicApiList<BlogPost>(`/blog?category=${encodeURIComponent(category)}&pageSize=3`, 60);
}

async function getGlobalFaqs() {
  const faqs = await fetchPublicApiList<Faq>('/faq', 300);
  return faqs.slice(0, 6);
}

function isGroupedFeatures(features: Product['features']): features is ProductFeatureGroup[] {
  return !!features?.length && !!(features[0] as ProductFeatureGroup).category;
}

const ROADMAP_STATUS_KEYS = ['launched', 'in_progress', 'planned'] as const;

const ROADMAP_STATUS_STYLE: Record<string, string> = {
  launched: 'text-green-700',
  in_progress: 'text-amber-700',
  planned: 'text-gray-600',
};

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'catalog' });
  const product = await getProduct(slug);
  if (!product) return { title: t('products.metadataFallback') };
  return buildMetadata({
    title: t('products.detail.titleSuffix', { title: product.seoTitle || product.name }),
    description: product.seoDescription || product.description,
    path: `/products/${slug}`,
    keywords: (product.keywords ? product.keywords.split(',').map((k) => k.trim()) : [product.category || '', product.name, 'produk digital Indonesia', 'Jakarta']).filter(Boolean),
    locale,
  });
}

export default async function ProductDetailPage({ params }: { params: RouteParams }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, format] = await Promise.all([getTranslations('catalog'), getFormatter()]);
  const [product, globalFaqs] = await Promise.all([
    getProduct(slug),
    getGlobalFaqs(),
  ]);
  if (!product) notFound();

  const formatPrice = (amount: number) =>
    format.number(amount, { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  const statusBadge = formatProductStatusBadge(product.customerCount, (count) =>
    t('products.statusBadge.customers', { count })
  );

  const faqs = product.faq && product.faq.length ? product.faq.map((f, i) => ({ id: String(i), ...f })) : globalFaqs;
  const relatedPosts = product.category ? await getRelatedPosts(product.category) : [];
  const grouped = isGroupedFeatures(product.features);
  const proofItems = grouped
    ? (product.features as ProductFeatureGroup[]).flatMap((group) => group.features).slice(0, 3)
    : (product.features as ProductFeatureItem[] | undefined)?.slice(0, 3) || [];

  const internalLinks = [
    { href: localePath('/contact', locale), label: t('common.freeConsultation') },
    { href: localePath('/faq', locale), label: t('common.faq') },
    ...relatedPosts.map((p) => ({ href: localePath(`/blog/${p.slug}`, locale), label: p.title })),
  ];

  const productsUrl = `${SITE_URL}${localePath('/products', locale)}`;

  const roadmapStatusLabel = (status: string) =>
    ROADMAP_STATUS_KEYS.includes(status as (typeof ROADMAP_STATUS_KEYS)[number])
      ? t(`products.roadmapStatus.${status}`)
      : status;

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: t('breadcrumb.home'), url: `${SITE_URL}${localePath('/', locale)}` },
        { name: t('breadcrumb.products'), url: productsUrl },
        { name: product.name, url: `${productsUrl}/${slug}` },
      ])} />
      <JsonLd data={productSchema({
        name: product.name,
        description: product.description,
        slug,
        category: product.category,
      })} />
      {faqs.length > 0 && (
        <JsonLd data={faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })))} />
      )}

      <PublicPageShell>
          <PageBreadcrumb
            items={[
              { label: t('breadcrumb.home'), href: localePath('/', locale) },
              { label: t('breadcrumb.products'), href: localePath('/products', locale) },
              { label: product.name },
            ]}
          />

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <DetailPageHeader
              kicker={product.category || t('products.kicker')}
              title={product.name}
              description={
                <>
                  {product.tagline && <p className="mb-3 text-lg text-slate-700">{product.tagline}</p>}
                  {product.description}
                </>
              }
              actions={
                <>
                  {product.primaryCta && (
                    <Button href={product.primaryCta.url} className="bg-teal-600 text-white hover:bg-teal-700">
                      {product.primaryCta.label}
                    </Button>
                  )}
                  {product.secondaryCtas?.slice(0, 1).map((cta, i) => (
                    <Button key={i} href={cta.url} variant="outline">
                      {cta.label}
                    </Button>
                  ))}
                </>
              }
            />

            <SaasPanel>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{t('products.detail.summaryKicker')}</p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-b border-[var(--border)] pb-5">
                <div>
                  <div className="text-2xl font-bold text-slate-950">{statusBadge || t('products.detail.statusActive')}</div>
                  <div className="mt-1 text-xs text-slate-500">{t('products.detail.statusLabel')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-950">{format.number(product.pricingTiers?.length || 0)}</div>
                  <div className="mt-1 text-xs text-slate-500">{t('products.detail.planCount')}</div>
                </div>
              </div>
              {proofItems.length > 0 && (
                <ul className="mt-5 space-y-3">
                  {proofItems.map((feature, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                      {feature.name || feature.title}
                    </li>
                  ))}
                </ul>
              )}
            </SaasPanel>
          </div>

          <nav className="sticky top-16 z-10 -mx-4 mt-8 flex gap-6 overflow-x-auto border-y border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm sm:mx-0" aria-label={t('products.detail.sectionNavAria')}>
            <a href="#features" className="whitespace-nowrap border-b-2 border-transparent py-1 font-medium text-slate-600 hover:border-blue-900 hover:text-slate-950">{t('products.detail.navFeatures')}</a>
            {product.useCases?.length ? <a href="#use-cases" className="whitespace-nowrap border-b-2 border-transparent py-1 font-medium text-slate-600 hover:border-blue-900 hover:text-slate-950">{t('products.detail.navUseCases')}</a> : null}
            {product.pricingTiers?.length ? <a href="#pricing" className="whitespace-nowrap border-b-2 border-transparent py-1 font-medium text-slate-600 hover:border-blue-900 hover:text-slate-950">{t('products.detail.navPricing')}</a> : null}
            {faqs.length > 0 ? <a href="#faq" className="whitespace-nowrap border-b-2 border-transparent py-1 font-medium text-slate-600 hover:border-blue-900 hover:text-slate-950">{t('products.detail.navFaq')}</a> : null}
          </nav>

          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {grouped ? (
                <div id="features">
                {(product.features as ProductFeatureGroup[]).map((group, gi) => (
                  <div key={gi} className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{group.category}</h2>
                    <div className="border-t border-slate-300">
                      {group.features.map((feature, i) => (
                        <div key={i} className="flex gap-3 border-b border-slate-200 py-4">
                          <CheckCircle className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">{feature.name || feature.title}</div>
                            {feature.description && <div className="text-sm text-gray-600 mt-1">{feature.description}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                </div>
              ) : product.features && product.features.length > 0 && (
                <div id="features" className="mt-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('products.detail.features')}</h2>
                  <div className="border-t border-slate-300">
                    {(product.features as ProductFeatureItem[]).map((feature, i) => (
                      <div key={i} className="flex gap-3 border-b border-slate-200 py-4">
                        <CheckCircle className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{feature.title || feature.name}</div>
                          {feature.description && <div className="text-sm text-gray-600 mt-1">{feature.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="sticky top-24 border-t-4 border-blue-900 bg-slate-50 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">{t('products.detail.interestedTitle')}</h3>
                {statusBadge && (
                  <span className="mb-3 inline-block text-xs font-semibold text-blue-900">
                    {statusBadge}
                  </span>
                )}
                <p className="text-sm text-gray-600 mb-6">{t('products.detail.interestedBody')}</p>
                <Button
                  href={product.demoUrl || `${localePath('/contact', locale)}?product=${encodeURIComponent(product.slug)}`}
                  className="w-full"
                >
                  {product.demoUrl ? t('common.scheduleDemo') : t('products.detail.contactUs')}
                </Button>
              </div>

              {product.relatedProducts && product.relatedProducts.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">{t('products.detail.relatedProducts')}</h3>
                  <div className="space-y-3">
                    {product.relatedProducts.map((related) => (
                      <Link key={related.id} href={`/products/${related.slug}`}
                        className="flex items-center justify-between border-b border-gray-200 py-3 hover:border-blue-900 transition-colors">
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

          {product.useCases && product.useCases.length > 0 && (
            <div id="use-cases" className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('products.detail.useCases')}</h2>
              <div className="border-t border-slate-300">
                {product.useCases.map((useCase) => (
                  <article key={useCase.id} className="grid gap-5 border-b border-slate-300 py-7 md:grid-cols-[0.7fr_1.3fr]">
                    <h3 className="text-lg font-semibold text-gray-900">{useCase.segment}</h3>
                    <div>
                      {useCase.description && <p className="text-sm leading-6 text-gray-600">{useCase.description}</p>}
                      {useCase.uniqueFeatures && useCase.uniqueFeatures.length > 0 && (
                        <ul className="mt-4 space-y-1.5">
                          {useCase.uniqueFeatures.map((f, i) => (
                            <li key={i} className="text-sm text-gray-600">— {f}</li>
                          ))}
                        </ul>
                      )}
                      {useCase.testimonial && (
                        <blockquote className="mt-4 border-l-2 border-blue-900 pl-3 text-sm italic text-gray-700">
                          &ldquo;{useCase.testimonial.quote}&rdquo;
                          <footer className="mt-1 text-xs text-gray-500 not-italic">
                            — {useCase.testimonial.author}{useCase.testimonial.company ? `, ${useCase.testimonial.company}` : ''}
                          </footer>
                        </blockquote>
                      )}
                      {useCase.cta && (
                        <Link href={useCase.cta.url} className="mt-4 inline-flex items-center text-sm font-medium text-blue-900 hover:underline">
                          {useCase.cta.label} <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {product.pricingTiers && product.pricingTiers.length > 0 && (
            <div id="pricing" className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('products.detail.pricing')}</h2>
              <div className="grid grid-cols-1 border-t border-slate-300 md:grid-cols-2 lg:grid-cols-5">
                {product.pricingTiers.map((tier) => (
                  <div key={tier.id} className={`flex flex-col border-b border-slate-300 p-5 lg:border-r ${tier.featured ? 'border-t-4 border-t-blue-900 bg-slate-50' : 'border-t border-slate-300'}`}>
                    {tier.popular && <span className="mb-2 inline-block w-fit text-xs font-bold uppercase tracking-wide text-blue-900">{t('products.detail.popular')}</span>}
                    <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                    {tier.tagline && <p className="text-xs text-gray-500 mt-1">{tier.tagline}</p>}
                    <div className="mt-3">
                      {tier.pricing.amount == null ? (
                        <span className="text-lg font-bold text-gray-900">{t('products.custom')}</span>
                      ) : tier.pricing.amount === 0 ? (
                        <span className="text-lg font-bold text-gray-900">{t('products.free')}</span>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">{formatPrice(tier.pricing.amount)}</span>
                      )}
                      {tier.pricing.billingPeriod && tier.pricing.amount !== null && tier.pricing.amount > 0 && (
                        <div className="text-xs text-gray-500">{tier.pricing.billingPeriod}</div>
                      )}
                      {tier.pricing.description && <div className="text-xs text-gray-500 mt-1">{tier.pricing.description}</div>}
                    </div>
                    <ul className="mt-4 flex-1 space-y-1.5">
                      {tier.features.map((f, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-blue-900 shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button href={tier.cta.url} variant={tier.featured ? 'primary' : 'secondary'} className="mt-4 w-full">
                      {tier.cta.label}
                    </Button>
                  </div>
                ))}
              </div>
              {product.pricingCalcUrl && (
                <p className="mt-4 text-center text-sm text-gray-600">
                  <Link href={product.pricingCalcUrl} className="text-blue-900 font-medium hover:underline">{t('products.detail.pricingCalc')}</Link>
                </p>
              )}
            </div>
          )}

          {product.integrations && product.integrations.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('products.detail.integrations')}</h2>
              <div className="grid grid-cols-2 border-t border-slate-300 sm:grid-cols-3 md:grid-cols-6">
                {product.integrations.map((integration, i) => (
                  <div key={i} className="border-b border-r border-slate-200 p-4">
                    <div className="font-medium text-sm text-gray-900">{integration.name}</div>
                    {integration.category && <div className="text-xs text-gray-500 mt-1">{integration.category}</div>}
                    {integration.status === 'coming_soon' && (
                      <span className="mt-2 inline-block text-xs text-amber-600">{t('products.detail.comingSoon')}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.comparisonTable && product.comparisonTable.rows?.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{product.comparisonTable.title || t('products.detail.comparison')}</h2>
              <div className="overflow-x-auto border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">{t('products.detail.comparisonFeature')}</th>
                      {product.comparisonTable.competitors.map((c) => (
                        <th key={c} className="text-left px-4 py-3 font-medium text-gray-600">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.comparisonTable.rows.map((row, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-900">{row.feature}</td>
                        {product.comparisonTable!.competitors.map((c) => (
                          <td key={c} className="px-4 py-3 text-gray-700">{row[c.toLowerCase().replace(/\s+/g, '')] ?? row[c] ?? '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {product.testimonials && product.testimonials.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('products.detail.testimonials')}</h2>
              <div className="grid grid-cols-1 border-t border-slate-300 md:grid-cols-3">
                {product.testimonials.map((item) => (
                  <blockquote key={item.id} className="border-b border-r border-slate-300 p-6">
                    <p className="text-sm italic text-gray-700">&ldquo;{item.quote}&rdquo;</p>
                    <div className="mt-4 text-sm font-medium text-gray-900">{item.author}</div>
                    <div className="text-xs text-gray-500">
                      {[item.company, item.employeeCount, item.location].filter(Boolean).join(' · ')}
                    </div>
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {product.roadmap && product.roadmap.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('products.detail.roadmap')}</h2>
              <div className="space-y-4">
                {product.roadmap.map((quarter, i) => (
                  <div key={i} className="flex gap-4 border-b border-slate-300 py-5">
                    <div className="w-24 shrink-0">
                      <div className="font-semibold text-gray-900 text-sm">{quarter.quarter}</div>
                      <span className={`mt-1 inline-block text-xs font-medium ${ROADMAP_STATUS_STYLE[quarter.status] || 'text-gray-600'}`}>
                        {roadmapStatusLabel(quarter.status)}
                      </span>
                    </div>
                    <ul className="flex-1 space-y-2">
                      {quarter.features.map((f, fi) => (
                        <li key={fi}>
                          <div className="font-medium text-sm text-gray-900">{f.name}</div>
                          {f.description && <div className="text-xs text-gray-600">{f.description}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {faqs.length > 0 && (
            <div id="faq" className="mt-20 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('products.detail.faq')}</h2>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <details key={faq.id} className="border-b border-gray-200 py-4 group">
                    <summary className="font-medium text-gray-900 cursor-pointer list-none flex justify-between items-center">
                      {faq.question}
                      <span className="text-gray-400 group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
                    </summary>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div className="mt-16 max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('common.relatedArticles')}</h2>
              <div className="space-y-3">
                {relatedPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}
                    className="block border-b border-gray-200 py-3 hover:border-blue-900 text-sm font-medium text-gray-900">
                    {post.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <PageEndCta />
      </PublicPageShell>
    </>
  );
}
