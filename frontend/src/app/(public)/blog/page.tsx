import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import type { BlogPost } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Blog' };

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
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900">Blog & Insights</h1>
          <p className="mt-4 text-slate-600">Latest news, trends, and technology insights</p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <Link href="/blog" className="px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white">All</Link>
            {categories.map((cat) => (
              <Link key={cat} href={`/blog?category=${cat}`}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  params.category === cat ? 'bg-blue-600 text-white' : 'border-slate-300 text-slate-600'
                }`}>{cat}</Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card hover className="h-full">
                <div className="text-xs text-blue-600 font-medium">{post.category}</div>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">{post.title}</h2>
                <p className="mt-2 text-sm text-slate-600 line-clamp-3">{post.excerpt}</p>
                <div className="mt-4 text-xs text-slate-500">
                  {post.publishedAt && formatDate(post.publishedAt)}
                  {post.author && ` · ${post.author.name}`}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={`/blog?page=${p}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  p === page ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-600'
                }`}>{p}</Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
