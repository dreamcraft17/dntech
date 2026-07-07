import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { PortfolioItem } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getItem(slug: string) {
  try {
    const res = await fetch(`${API_URL}/portfolio/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data as PortfolioItem;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItem(slug);
  return { title: item?.title || 'Case Study' };
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getItem(slug);
  if (!item) notFound();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/portfolio" className="hover:text-blue-600">Portfolio</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{item.title}</span>
        </nav>

        <div className="h-64 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-8" />

        <h1 className="text-4xl font-bold text-slate-900">{item.title}</h1>
        <p className="mt-2 text-lg text-slate-500">Client: {item.clientName}</p>

        <div className="mt-8 prose max-w-none">
          <h2>Project Overview</h2>
          <p>{item.description}</p>

          {item.outcomes && (
            <>
              <h2>Results & Outcomes</h2>
              <p>{item.outcomes}</p>
            </>
          )}

          {item.testimonial && (
            <blockquote className="border-l-4 border-blue-600 pl-4 italic text-slate-600 my-6">
              &ldquo;{item.testimonial}&rdquo;
            </blockquote>
          )}
        </div>

        <div className="mt-10">
          <Link href="/contact">
            <Button>Start Your Project</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
