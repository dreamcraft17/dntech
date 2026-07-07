import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Service } from '@/types';
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  return {
    title: service?.seoTitle || service?.name || 'Service',
    description: service?.seoDescription || service?.description,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const features = (service.features as { title: string; description?: string }[]) || [];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/services" className="hover:text-blue-600">Services</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{service.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="text-sm text-blue-600 font-medium mb-2">{service.category}</div>
            <h1 className="text-4xl font-bold text-slate-900">{service.name}</h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">{service.description}</p>

            {features.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features.map((feature, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-lg bg-slate-50">
                      <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-slate-900">{feature.title}</div>
                        {feature.description && (
                          <div className="text-sm text-slate-600 mt-1">{feature.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 p-6 rounded-xl bg-blue-50 border border-blue-100 lg:hidden">
              <h3 className="font-semibold text-slate-900">Ready to get started?</h3>
              <p className="mt-2 text-sm text-slate-600">Request a free consultation with our experts.</p>
              <Link href={`/contact?service=${encodeURIComponent(service.slug)}`} className="inline-block mt-4">
                <Button>Request Demo</Button>
              </Link>
            </div>
          </div>

          <div>
            <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Interested in this service?</h3>
              <p className="text-sm text-slate-600 mb-6">Get a free consultation with our experts.</p>
              <Link href={`/contact?service=${encodeURIComponent(service.slug)}`}>
                <Button className="w-full">Request Free Demo</Button>
              </Link>
              <Link href="/case-studies" className="mt-3 block text-center text-sm text-blue-600 hover:underline">
                View related case studies →
              </Link>
            </div>

            {service.relatedServices && service.relatedServices.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-slate-900 mb-4">Related Services</h3>
                <div className="space-y-3">
                  {service.relatedServices.map((related) => (
                    <Link
                      key={related.id}
                      href={`/services/${related.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-900">{related.name}</span>
                      <ArrowRight className="h-4 w-4 text-blue-600" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
