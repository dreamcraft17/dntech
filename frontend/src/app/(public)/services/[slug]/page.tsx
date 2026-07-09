import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JsonLd, breadcrumbSchema, serviceSchema, faqSchema } from '@/components/seo/JsonLd';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { CalendlyEmbed } from '@/components/interactive/CalendlyEmbed';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { SERVICE_PROCESS_STEPS } from '@/lib/service-process';
import { getPublicSettings } from '@/lib/settings';
import type { Service, BlogPost, Faq } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getService(slug: string) {
  try {
    const res = await fetch(`${API_URL}/services/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data as Service;
  } catch {
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

async function getFaqs() {
  try {
    const res = await fetch(`${API_URL}/faq`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return ((await res.json()).data as Faq[]).slice(0, 6);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: 'Layanan' };
  return buildMetadata({
    title: `${service.seoTitle || service.name} — Indonesia`,
    description: service.seoDescription || service.description,
    path: `/services/${slug}`,
    keywords: [service.category || '', service.name, 'software development Indonesia', 'Jakarta'].filter(Boolean),
  });
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, settings, faqs] = await Promise.all([
    getService(slug),
    getPublicSettings(),
    getFaqs(),
  ]);
  if (!service) notFound();

  const features = (service.features as { title: string; description?: string }[]) || [];
  const relatedPosts = service.category ? await getRelatedPosts(service.category) : [];
  const calendlyUrl = settings.calendlyUrl;

  const internalLinks = [
    { href: '/contact', label: 'Konsultasi Gratis' },
    { href: '/faq', label: 'FAQ' },
    ...relatedPosts.map((p) => ({ href: `/blog/${p.slug}`, label: p.title })),
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Beranda', url: SITE_URL },
        { name: 'Layanan', url: `${SITE_URL}/services` },
        { name: service.name, url: `${SITE_URL}/services/${slug}` },
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

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-500 mb-8" aria-label="Jejak navigasi">
            <Link href="/" className="hover:text-blue-900">Beranda</Link>
            <span className="mx-2">/</span>
            <Link href="/services" className="hover:text-blue-900">Layanan</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{service.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {service.category && (
                <div className="text-sm text-teal-600 font-medium mb-2">{service.category}</div>
              )}
              <h1 className="text-4xl font-bold text-gray-900">{service.name}</h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">{service.description}</p>

              {features.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Yang Termasuk</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((feature, i) => (
                      <div key={i} className="flex gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                        <CheckCircle className="h-5 w-5 text-blue-900 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{feature.title}</div>
                          {feature.description && (
                            <div className="text-sm text-gray-600 mt-1">{feature.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Proses Kerja</h2>
                <div className="space-y-4">
                  {SERVICE_PROCESS_STEPS.map((step) => (
                    <div key={step.step} className="flex gap-4 p-4 rounded-lg border border-gray-200">
                      <div className="h-10 w-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold shrink-0">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {faqs.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Pertanyaan Umum</h2>
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
                <div className="mt-12">
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
            </div>

            <div>
              <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Mulai diskusi proyek Anda</h3>
                <p className="text-sm text-gray-600 mb-6">Konsultasi gratis — respons dalam 24 jam.</p>
                <Button href={`/contact?service=${encodeURIComponent(service.slug)}`} className="w-full">
                  Konsultasi Gratis
                </Button>
              </div>

              {service.relatedServices && service.relatedServices.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Layanan Terkait</h3>
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
                <InternalLinks title="Pelajari Lebih Lanjut" links={internalLinks.slice(0, 5)} />
              </div>
            </div>
          </div>

          <div className="mt-16">
            <CalendlyEmbed url={calendlyUrl} />
          </div>
        </div>
      </div>
    </>
  );
}
