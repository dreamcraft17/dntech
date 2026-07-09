import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ContentPillars } from '@/components/content/ContentPillars';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { formatDate } from '@/lib/utils';
import { estimateReadTime, formatReadTime } from '@/lib/read-time';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';
import type { BlogPost } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.blog.title,
  description: PAGE_SEO.blog.description,
  path: '/blog',
  keywords: PAGE_SEO.blog.keywords,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getPosts(page = 1, category?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: '10' });
  if (category) params.set('category', category);
  try {
    const res = await fetch(`${API_URL}/blog?${params}`, { next: { revalidate: 60 } });
    if (!res.ok) return { posts: [], pages: 1 };
    const json = await res.json();
    return { posts: json.data as BlogPost[], pages: json.pagination?.pages || 1 };
  } catch {
    return { posts: [], pages: 1 };
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const { posts, pages } = await getPosts(page, params.category);
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Beranda', url: SITE_URL },
        { name: 'Blog', url: `${SITE_URL}/blog` },
      ])} />
      {posts.length > 0 && (
        <JsonLd data={itemListSchema(posts.map((p) => ({
          name: p.title,
          url: `${SITE_URL}/blog/${p.slug}`,
        })))} />
      )}

      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">Blog & Wawasan</h1>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Panduan tech stack, scaling software, dan saran untuk founder startup Indonesia
            </p>
          </div>

          <ContentPillars />

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              <Link href="/blog" className={`px-4 py-2 rounded-full text-sm font-medium min-h-[44px] flex items-center ${!params.category ? 'bg-blue-900 text-white' : 'border border-gray-300 text-gray-600'}`}>Semua</Link>
              {categories.map((cat) => (
                <Link key={cat} href={`/blog?category=${cat}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium border min-h-[44px] flex items-center ${
                    params.category === cat ? 'bg-blue-900 text-white border-blue-900' : 'border-gray-300 text-gray-600'
                  }`}>{cat}</Link>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const readMin = estimateReadTime(post.content || post.excerpt);
              return (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card hover className="h-full">
                  <div className="text-xs text-teal-600 font-medium">{post.category}</div>
                  <h2 className="mt-2 text-lg font-semibold text-gray-900">{post.title}</h2>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
                  <div className="mt-4 text-xs text-gray-500">
                    {formatReadTime(readMin)}
                    {post.publishedAt && ` · ${formatDate(post.publishedAt)}`}
                    {post.author && ` · ${post.author.name}`}
                  </div>
                </Card>
              </Link>
            );})}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`/blog?page=${p}${params.category ? `&category=${params.category}` : ''}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    p === page ? 'bg-blue-900 text-white' : 'border border-gray-300 text-gray-600'
                  }`}>{p}</Link>
              ))}
            </div>
          )}

          <div className="mt-16 text-center p-6 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-gray-600">Ingin menerapkan apa yang Anda baca?</p>
            <div className="mt-3 flex flex-wrap gap-4 justify-center text-sm">
              <Link href="/services" className="text-blue-900 font-medium hover:underline">Jelajahi Layanan</Link>
              <Link href="/case-studies" className="text-blue-900 font-medium hover:underline">Lihat Studi Kasus</Link>
              <Link href="/contact" className="text-blue-900 font-medium hover:underline">Konsultasi dengan Ahli</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
