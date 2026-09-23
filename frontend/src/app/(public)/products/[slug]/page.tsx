import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JsonLd, breadcrumbSchema, productSchema, faqSchema } from '@/components/seo/JsonLd';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { formatCurrencyIDR } from '@/lib/utils';
import type { Product, ProductFeatureGroup, ProductFeatureItem, BlogPost, Faq } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatProductStatusBadge } from '@/lib/product-status';
import { fetchPublicApiList, fetchPublicApiSafe } from '@/lib/server-api';

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

const ROADMAP_STATUS_LABEL: Record<string, string> = {
  launched: 'Launched',
  in_progress: 'Sedang Dikerjakan',
  planned: 'Direncanakan',
};

const ROADMAP_STATUS_STYLE: Record<string, string> = {
  launched: 'text-green-700',
  in_progress: 'text-amber-700',
  planned: 'text-gray-600',
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Produk' };
  return buildMetadata({
    title: `${product.seoTitle || product.name} — Indonesia`,
    description: product.seoDescription || product.description,
    path: `/products/${slug}`,
    keywords: (product.keywords ? product.keywords.split(',').map((k) => k.trim()) : [product.category || '', product.name, 'produk digital Indonesia', 'Jakarta']).filter(Boolean),
  });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, globalFaqs] = await Promise.all([
    getProduct(slug),
    getGlobalFaqs(),
  ]);
  if (!product) notFound();

  const statusBadge = formatProductStatusBadge(product.customerCount);

  const faqs = product.faq && product.faq.length ? product.faq.map((f, i) => ({ id: String(i), ...f })) : globalFaqs;
  const relatedPosts = product.category ? await getRelatedPosts(product.category) : [];
  const grouped = isGroupedFeatures(product.features);
  const proofItems = grouped
    ? (product.features as ProductFeatureGroup[]).flatMap((group) => group.features).slice(0, 3)
    : (product.features as ProductFeatureItem[] | undefined)?.slice(0, 3) || [];

  const internalLinks = [
    { href: '/contact', label: 'Konsultasi Gratis' },
    { href: '/faq', label: 'FAQ' },
    ...relatedPosts.map((p) => ({ href: `/blog/${p.slug}`, label: p.title })),
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Beranda', url: SITE_URL },
        { name: 'Produk', url: `${SITE_URL}/products` },
        { name: product.name, url: `${SITE_URL}/products/${slug}` },
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

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-500 mb-8" aria-label="Jejak navigasi">
            <Link href="/" className="hover:text-blue-900">Beranda</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-blue-900">Produk</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <section className="border-y-2 border-slate-900 px-1 py-10 text-slate-900 sm:px-3 lg:py-14">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                {product.category && <div className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">{product.category}</div>}
                <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{product.name}</h1>
                {product.tagline && <p className="mt-3 text-xl text-slate-700">{product.tagline}</p>}
                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">{product.description}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {product.primaryCta && <Button href={product.primaryCta.url} className="bg-teal-600 text-white hover:bg-teal-700">{product.primaryCta.label}</Button>}
                  {product.secondaryCtas?.slice(0, 1).map((cta, i) => <Button key={i} href={cta.url} variant="outline">{cta.label}</Button>)}
                </div>
              </div>

              <div className="border-l-2 border-teal-600 pl-6 lg:pl-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Product proof</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-4 border-b border-slate-200 pb-5">
                  <div><div className="text-2xl font-bold">{statusBadge || 'Active'}</div><div className="mt-1 text-xs text-slate-500">Status produk</div></div>
                  <div><div className="text-2xl font-bold">{product.pricingTiers?.length || 0}</div><div className="mt-1 text-xs text-slate-500">Pilihan paket</div></div>
                </div>
                {proofItems.length > 0 && (
                  <ul className="mt-5 space-y-3">
                    {proofItems.map((feature, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />{feature.name || feature.title}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <nav className="sticky top-16 z-10 -mx-4 mt-8 flex gap-6 overflow-x-auto border-y border-slate-200 bg-white px-4 py-3 text-sm sm:mx-0" aria-label="Navigasi detail produk">
            <a href="#features" className="whitespace-nowrap border-b-2 border-transparent py-1 font-medium text-slate-600 hover:border-blue-900 hover:text-slate-950">Fitur & outcomes</a>
            {product.useCases?.length ? <a href="#use-cases" className="whitespace-nowrap border-b-2 border-transparent py-1 font-medium text-slate-600 hover:border-blue-900 hover:text-slate-950">Use case</a> : null}
            {product.pricingTiers?.length ? <a href="#pricing" className="whitespace-nowrap border-b-2 border-transparent py-1 font-medium text-slate-600 hover:border-blue-900 hover:text-slate-950">Pricing</a> : null}
            {faqs.length > 0 ? <a href="#faq" className="whitespace-nowrap border-b-2 border-transparent py-1 font-medium text-slate-600 hover:border-blue-900 hover:text-slate-950">FAQ</a> : null}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Fitur Produk</h2>
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
                <h3 className="font-semibold text-gray-900 mb-4">Tertarik dengan produk ini?</h3>
                {statusBadge && (
                  <span className="mb-3 inline-block text-xs font-semibold text-blue-900">
                    {statusBadge}
                  </span>
                )}
                <p className="text-sm text-gray-600 mb-6">
                  Hubungi kami — respons dalam 24 jam.
                </p>
                <Button href={product.demoUrl || `/contact?product=${encodeURIComponent(product.slug)}`} className="w-full">
                  {product.demoUrl ? 'Jadwalkan Demo' : 'Hubungi Kami'}
                </Button>
              </div>

              {product.relatedProducts && product.relatedProducts.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Produk Terkait</h3>
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
                <InternalLinks title="Pelajari Lebih Lanjut" links={internalLinks.slice(0, 5)} />
              </div>
            </div>
          </div>

          {product.useCases && product.useCases.length > 0 && (
            <div id="use-cases" className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Solusi untuk Segmen Anda</h2>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Pricing</h2>
              <div className="grid grid-cols-1 border-t border-slate-300 md:grid-cols-2 lg:grid-cols-5">
                {product.pricingTiers.map((tier) => (
                  <div key={tier.id} className={`flex flex-col border-b border-slate-300 p-5 lg:border-r ${tier.featured ? 'border-t-4 border-t-blue-900 bg-slate-50' : 'border-t border-slate-300'}`}>
                    {tier.popular && <span className="mb-2 inline-block w-fit text-xs font-bold uppercase tracking-wide text-blue-900">Populer</span>}
                    <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                    {tier.tagline && <p className="text-xs text-gray-500 mt-1">{tier.tagline}</p>}
                    <div className="mt-3">
                      {tier.pricing.amount == null ? (
                        <span className="text-lg font-bold text-gray-900">Custom</span>
                      ) : tier.pricing.amount === 0 ? (
                        <span className="text-lg font-bold text-gray-900">Gratis</span>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">{formatCurrencyIDR(tier.pricing.amount)}</span>
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
                  <Link href={product.pricingCalcUrl} className="text-blue-900 font-medium hover:underline">Hitung estimasi harga Anda</Link>
                </p>
              )}
            </div>
          )}

          {product.integrations && product.integrations.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Integrasi</h2>
              <div className="grid grid-cols-2 border-t border-slate-300 sm:grid-cols-3 md:grid-cols-6">
                {product.integrations.map((integration, i) => (
                  <div key={i} className="border-b border-r border-slate-200 p-4">
                    <div className="font-medium text-sm text-gray-900">{integration.name}</div>
                    {integration.category && <div className="text-xs text-gray-500 mt-1">{integration.category}</div>}
                    {integration.status === 'coming_soon' && (
                      <span className="mt-2 inline-block text-xs text-amber-600">Coming Soon</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.comparisonTable && product.comparisonTable.rows?.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{product.comparisonTable.title || 'Perbandingan'}</h2>
              <div className="overflow-x-auto border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Fitur</th>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Kata Pelanggan</h2>
              <div className="grid grid-cols-1 border-t border-slate-300 md:grid-cols-3">
                {product.testimonials.map((t) => (
                  <blockquote key={t.id} className="border-b border-r border-slate-300 p-6">
                    <p className="text-sm italic text-gray-700">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-4 text-sm font-medium text-gray-900">{t.author}</div>
                    <div className="text-xs text-gray-500">
                      {[t.company, t.employeeCount, t.location].filter(Boolean).join(' · ')}
                    </div>
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {product.roadmap && product.roadmap.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Roadmap</h2>
              <div className="space-y-4">
                {product.roadmap.map((quarter, i) => (
                  <div key={i} className="flex gap-4 border-b border-slate-300 py-5">
                    <div className="w-24 shrink-0">
                      <div className="font-semibold text-gray-900 text-sm">{quarter.quarter}</div>
                      <span className={`mt-1 inline-block text-xs font-medium ${ROADMAP_STATUS_STYLE[quarter.status] || 'text-gray-600'}`}>
                        {ROADMAP_STATUS_LABEL[quarter.status] || quarter.status}
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Pertanyaan Umum</h2>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <details key={faq.id} className="border-b border-gray-200 py-4 group">
                    <summary className="font-medium text-gray-900 cursor-pointer list-none flex justify-between items-center">
                      {faq.question}
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div className="mt-16 max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Artikel Terkait</h2>
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

          {(product.primaryCta || product.secondaryCtas?.length) && (
            <div className="mt-20 border-y-2 border-blue-900 bg-blue-900 px-8 py-12 text-center">
              <h2 className="text-2xl font-bold text-white">Siap mencoba {product.name}?</h2>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                {product.primaryCta && (
                  <Button href={product.primaryCta.url} className="bg-white text-blue-900 hover:bg-gray-100">
                    {product.primaryCta.label}
                  </Button>
                )}
                {product.secondaryCtas?.map((cta, i) => (
                  <Button key={i} href={cta.url} variant="outline-on-dark" className="hover:bg-blue-800">
                    {cta.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
