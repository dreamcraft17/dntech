import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { JsonLd, breadcrumbSchema, productSchema, faqSchema } from '@/components/seo/JsonLd';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { formatCurrencyIDR } from '@/lib/utils';
import type { Product, ProductFeatureGroup, ProductFeatureItem, BlogPost, Faq } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/api';

const API_URL = getApiBaseUrl();

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data as Product;
  } catch (error) {
    console.error('[products] Failed to load product detail', { slug, apiUrl: API_URL, error });
    return null;
  }
}

async function getRelatedPosts(category: string) {
  try {
    const res = await fetch(`${API_URL}/blog?category=${encodeURIComponent(category)}&pageSize=3`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()).data as BlogPost[];
  } catch {
    return [];
  }
}

async function getGlobalFaqs() {
  try {
    const res = await fetch(`${API_URL}/faq`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return ((await res.json()).data as Faq[]).slice(0, 6);
  } catch {
    return [];
  }
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

  const faqs = product.faq && product.faq.length ? product.faq.map((f, i) => ({ id: String(i), ...f })) : globalFaqs;
  const relatedPosts = product.category ? await getRelatedPosts(product.category) : [];
  const grouped = isGroupedFeatures(product.features);

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {product.category && (
                <div className="text-sm text-teal-600 font-medium mb-2">{product.category}</div>
              )}
              <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
              {product.tagline && <p className="mt-2 text-xl text-gray-700">{product.tagline}</p>}
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">{product.description}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                {product.primaryCta && (
                  <Button href={product.primaryCta.url} className="min-w-[180px]">{product.primaryCta.label}</Button>
                )}
                {product.secondaryCtas?.map((cta, i) => (
                  <Button key={i} href={cta.url} variant="secondary">{cta.label}</Button>
                ))}
              </div>

              {grouped ? (
                (product.features as ProductFeatureGroup[]).map((group, gi) => (
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
                ))
              ) : product.features && product.features.length > 0 && (
                <div className="mt-12">
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
                <p className="text-sm text-gray-600 mb-6">
                  {product.customerCount ? `Dipercaya ${product.customerCount} pelanggan. ` : ''}
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
            <div className="mt-20">
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
            <div className="mt-20 max-w-3xl mx-auto">
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
                  <Button key={i} href={cta.url} variant="secondary" className="border-white text-white hover:bg-blue-800">
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
