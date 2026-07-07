import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JsonLd, breadcrumbSchema } from '@/components/seo/JsonLd';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface CaseStudy {
  slug: string;
  title: string;
  description?: string;
  challenge?: string;
  solution?: string;
  results?: string;
  metrics?: Record<string, string>;
  clientName?: string;
  industries?: string[];
}

async function getCaseStudy(slug: string) {
  try {
    const res = await fetch(`${API_URL}/case-studies/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data as CaseStudy;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCaseStudy(slug);
  return {
    title: item?.title || 'Case Study',
    description: item?.description,
    openGraph: { title: item?.title, description: item?.description || undefined },
  };
}

export default async function CaseStudyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getCaseStudy(slug);
  if (!item) notFound();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Case Studies', url: `${SITE_URL}/case-studies` },
        { name: item.title, url: `${SITE_URL}/case-studies/${slug}` },
      ])} />

      <div className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-slate-500 mb-8">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/case-studies" className="hover:text-blue-600">Case Studies</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">{item.title}</span>
          </nav>

          <div className="h-48 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-8 flex items-end p-6">
            {item.industries && item.industries.length > 0 && (
              <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white">{item.industries[0]}</span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-slate-900">{item.title}</h1>
          {item.clientName && <p className="mt-2 text-lg text-slate-500">{item.clientName}</p>}
          {item.description && <p className="mt-6 text-lg text-slate-600 leading-relaxed">{item.description}</p>}

          {item.metrics && Object.keys(item.metrics).length > 0 && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(item.metrics).map(([key, val]) => (
                <div key={key} className="text-center p-4 rounded-xl bg-green-50 border border-green-100">
                  <div className="text-2xl font-bold text-green-700">{val}</div>
                  <div className="text-xs text-green-600 mt-1 capitalize">{key.replace(/_/g, ' ')}</div>
                </div>
              ))}
            </div>
          )}

          {item.challenge && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">The Challenge</h2>
              <p className="text-slate-600 leading-relaxed">{item.challenge}</p>
            </section>
          )}

          {item.solution && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Our Solution</h2>
              <p className="text-slate-600 leading-relaxed">{item.solution}</p>
            </section>
          )}

          {item.results && (
            <section className="mt-10 p-6 rounded-xl bg-blue-50 border border-blue-100">
              <h2 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" /> Results
              </h2>
              <p className="text-slate-700">{item.results}</p>
            </section>
          )}

          <div className="mt-12 flex flex-wrap gap-4">
            <Link href="/contact">
              <Button size="lg">Start Your Project <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link href="/case-studies">
              <Button size="lg" variant="outline">More Case Studies</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
