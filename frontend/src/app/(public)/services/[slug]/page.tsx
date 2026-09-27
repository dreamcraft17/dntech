import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JsonLd, breadcrumbSchema, serviceSchema, faqSchema } from '@/components/seo/JsonLd';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { CalendlyEmbed } from '@/components/interactive/CalendlyEmbed';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { SERVICE_PROCESS_STEPS } from '@/lib/service-process';
import { getPublicSettings } from '@/lib/settings';
import { fetchPublicApiList, fetchPublicApiSafe } from '@/lib/server-api';
import type { Service, BlogPost, Faq } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicPageShell, SaasPanel } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';
import { PageBreadcrumb } from '@/components/layout/PageBreadcrumb';
import { DetailPageHeader } from '@/components/layout/DetailPageHeader';
import { DetailSection } from '@/components/layout/DetailSection';

async function getService(slug: string) {
  return fetchPublicApiSafe<Service>(`/services/${slug}`, 60);
}

async function getRelatedPosts(category: string) {
  return fetchPublicApiList<BlogPost>(`/blog?category=${encodeURIComponent(category)}&pageSize=3`, 60);
}

async function getFaqs() {
  const faqs = await fetchPublicApiList<Faq>('/faq', 300);
  return faqs.slice(0, 6);
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

      <PublicPageShell>
          <PageBreadcrumb
            items={[
              { label: 'Beranda', href: '/' },
              { label: 'Layanan', href: '/services' },
              { label: service.name },
            ]}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DetailPageHeader
                kicker={service.category || 'Layanan'}
                title={service.name}
                description={service.description}
                actions={
                  <>
                    <Button href={`/contact?service=${encodeURIComponent(service.slug)}`}>Bahas kebutuhan ini</Button>
                    <Button href="#process" variant="outline">
                      Lihat cara kerja
                    </Button>
                  </>
                }
              />

              {features.length > 0 && (
                <DetailSection title="Yang termasuk">
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

              <DetailSection title="Proses kerja" className="scroll-mt-24" >
                <div id="process" className="space-y-4">
                  {SERVICE_PROCESS_STEPS.map((step) => (
                    <SaasPanel key={step.step} className="flex gap-4 !p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-blue-900 bg-blue-900 font-bold text-white">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </SaasPanel>
                  ))}
                </div>
              </DetailSection>

              {faqs.length > 0 && (
                <DetailSection title="Pertanyaan umum">
                  <div className="space-y-3">
                    {faqs.map((faq) => (
                      <SaasPanel key={faq.id} className="group !p-0 overflow-hidden">
                      <details className="p-4">
                        <summary className="font-medium text-gray-900 cursor-pointer list-none flex justify-between items-center">
                          {faq.question}
                          <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
                      </details>
                      </SaasPanel>
                    ))}
                  </div>
                </DetailSection>
              )}

              {relatedPosts.length > 0 && (
                <DetailSection title="Artikel terkait">
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
                <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Next step</p>
                <h3 className="mt-2 font-semibold text-slate-950">Mulai diskusi proyek Anda</h3>
                <p className="mb-6 mt-3 text-sm leading-6 text-slate-600">Konsultasi gratis — respons dalam 24 jam.</p>
                <Button href={`/contact?service=${encodeURIComponent(service.slug)}`} className="w-full">
                  Konsultasi Gratis
                </Button>
              </SaasPanel>

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
          <PageEndCta />
      </PublicPageShell>
    </>
  );
}
