import Link from 'next/link';
import { ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
  launched: 'bg-green-100 text-green-700',
  in_progress: 'bg-amber-100 text-amber-700',
  planned: 'bg-gray-100 text-gray-600',
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

          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-teal-50 px-6 py-10 text-slate-900 shadow-sm sm:px-10 lg:px-14 lg:py-14">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-300/25 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl" aria-hidden="true" />
            <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
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

              <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Product proof</span>
                  <ShieldCheck className="h-5 w-5 text-teal-600" aria-hidden="true" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-100 p-4"><div className="text-2xl font-bold">{statusBadge || 'Active'}</div><div className="mt-1 text-xs text-slate-500">Status produk</div></div>
                  <div className="rounded-xl bg-slate-100 p-4"><div className="text-2xl font-bold">{product.pricingTiers?.length || 0}</div><div className="mt-1 text-xs text-slate-500">Pilihan paket</div></div>
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

          <nav className="sticky top-16 z-10 -mx-4 mt-8 flex gap-2 overflow-x-auto border-y border-slate-200 bg-white/95 px-4 py-3 text-sm backdrop-blur sm:mx-0 sm:rounded-xl sm:border" aria-label="Navigasi detail produk">
            <a href="#features" className="whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">Fitur & outcomes</a>
            {product.useCases?.length ? <a href="#use-cases" className="whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">Use case</a> : null}
            {product.pricingTiers?.length ? <a href="#pricing" className="whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">Pricing</a> : null}
            {faqs.length > 0 ? <a href="#faq" className="whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">FAQ</a> : null}
          </nav>

          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {grouped ? (
                <div id="features">
                {(product.features as ProductFeatureGroup[]).map((group, gi) => (
                  <div key={gi} className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{group.category}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {group.features.map((feature, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(product.features as ProductFeatureItem[]).map((feature, i) => (
                      <div key={i} className="flex gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
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
              <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tertarik dengan produk ini?</h3>
                {statusBadge && (
                  <span className="mb-3 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-900">
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
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Solusi untuk Segmen Anda</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {product.useCases.map((useCase) => (
                  <Card key={useCase.id} className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900">{useCase.segment}</h3>
                    {useCase.description && <p className="mt-2 text-sm text-gray-600">{useCase.description}</p>}
                    {useCase.uniqueFeatures && useCase.uniqueFeatures.length > 0 && (
                      <ul className="mt-4 space-y-1.5">
                        {useCase.uniqueFeatures.map((f, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-900 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    {useCase.testimonial && (
                      <blockquote className="mt-4 text-sm italic text-gray-700 border-l-2 border-blue-900 pl-3">
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
                  </Card>
                ))}
              </div>
            </div>
          )}

          {product.pricingTiers && product.pricingTiers.length > 0 && (
            <div id="pricing" className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {product.pricingTiers.map((tier) => (
                  <div key={tier.id} className={`flex flex-col rounded-lg border p-5 ${tier.featured ? 'border-blue-900 shadow-md ring-1 ring-blue-900' : 'border-gray-200'}`}>
                    {tier.popular && <span className="mb-2 inline-block w-fit rounded-full bg-blue-900 px-2 py-0.5 text-xs font-medium text-white">Populer</span>}
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Integrasi</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {product.integrations.map((integration, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-4 text-center">
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
              <div className="overflow-x-auto rounded-lg border border-gray-200">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Kata Pelanggan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {product.testimonials.map((t) => (
                  <Card key={t.id}>
                    <p className="text-sm italic text-gray-700">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-4 text-sm font-medium text-gray-900">{t.author}</div>
                    <div className="text-xs text-gray-500">
                      {[t.company, t.employeeCount, t.location].filter(Boolean).join(' · ')}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {product.roadmap && product.roadmap.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Roadmap</h2>
              <div className="space-y-4">
                {product.roadmap.map((quarter, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-lg border border-gray-200">
                    <div className="w-24 shrink-0">
                      <div className="font-semibold text-gray-900 text-sm">{quarter.quarter}</div>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ROADMAP_STATUS_STYLE[quarter.status] || 'bg-gray-100 text-gray-600'}`}>
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
                  <details key={faq.id} className="rounded-lg border border-gray-200 p-4 group">
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
                    className="block p-3 rounded-lg border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-900">
                    {post.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(product.primaryCta || product.secondaryCtas?.length) && (
            <div className="mt-20 rounded-lg bg-blue-900 px-8 py-12 text-center">
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
