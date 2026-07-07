import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { PortfolioItem } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Portfolio' };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getPortfolio() {
  try {
    const res = await fetch(`${API_URL}/portfolio?pageSize=12`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()).data as PortfolioItem[];
  } catch {
    return [];
  }
}

export default async function PortfolioPage() {
  const items = await getPortfolio();
  const industries = [...new Set(items.flatMap((i) => (i.industries as string[]) || []))];

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900">Our Portfolio</h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Showcasing successful projects and client transformations
          </p>
        </div>

        {industries.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {industries.map((ind) => (
              <span key={ind} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {ind}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link key={item.id} href={`/portfolio/${item.slug}`}>
              <Card hover className="h-full">
                <div className="h-40 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold opacity-50">{item.title.charAt(0)}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {((item.industries as string[]) || []).map((ind) => (
                    <span key={ind} className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">{ind}</span>
                  ))}
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{item.clientName}</p>
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{item.description}</p>
                <span className="mt-4 inline-flex items-center text-sm text-blue-600 font-medium">
                  View case study <ArrowRight className="h-4 w-4 ml-1" />
                </span>
              </Card>
            </Link>
          ))}
        </div>

        {items.length === 0 && (
          <p className="text-center text-slate-500 py-12">No portfolio items yet.</p>
        )}
      </div>
    </div>
  );
}
