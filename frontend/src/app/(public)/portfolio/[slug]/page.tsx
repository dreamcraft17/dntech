import Link from 'next/link';
import Image from 'next/image';
import { FolderOpen } from 'lucide-react';
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
  return { title: item?.title || 'Studi Kasus' };
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getItem(slug);
  if (!item) notFound();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/portfolio" className="text-blue-900 hover:underline">
            Portofolio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{item.title}</span>
        </nav>

        {item.featuredImage?.url ? (
          <div className="relative mb-8 h-64 overflow-hidden rounded-lg">
            <Image
              src={item.featuredImage.url}
              alt={item.featuredImage.altText || item.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        ) : (
          <div className="mb-8 flex h-64 items-center justify-center rounded-lg bg-blue-900/10">
            <FolderOpen className="h-16 w-16 text-blue-900" />
          </div>
        )}

        <h1 className="text-4xl font-bold text-gray-900">{item.title}</h1>
        <p className="mt-2 text-lg text-gray-500">Klien: {item.clientName}</p>

        <div className="prose mt-8 max-w-none">
          <h2>Ringkasan Proyek</h2>
          <p>{item.description}</p>

          {item.outcomes && (
            <>
              <h2>Hasil & Capaian</h2>
              <p>{item.outcomes}</p>
            </>
          )}

          {item.testimonial && (
            <blockquote className="my-6 border-l-4 border-blue-900 pl-4 italic text-gray-600">
              &ldquo;{item.testimonial}&rdquo;
            </blockquote>
          )}
        </div>

        <div className="mt-10">
          <Link href="/contact">
            <Button>Mulai Proyek Anda</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
