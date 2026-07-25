import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ContentPillars } from '@/components/content/ContentPillars';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { formatDate } from '@/lib/utils';
import { estimateReadTime, formatReadTime } from '@/lib/read-time';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';
import { CONTENT_PILLARS } from '@/lib/content-pillars';
import { fetchPublicApiPaginated } from '@/lib/server-api';
import type { BlogPost } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.blog.title,
  description: PAGE_SEO.blog.description,
  path: '/blog',
  keywords: PAGE_SEO.blog.keywords,
});

async function getPosts(page = 1, category?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: '10' });
  if (category) params.set('category', category);
  const { data, pagination } = await fetchPublicApiPaginated<BlogPost>(`/blog?${params}`, 60);
  return { posts: data, pages: pagination?.pages || 1 };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const { posts, pages } = await getPosts(page, params.category);

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

          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-sm font-medium min-h-[44px] flex items-center ${
                !params.category ? 'bg-blue-900 text-white' : 'border border-gray-300 text-gray-600'
              }`}
            >
              Semua
            </Link>
            {CONTENT_PILLARS.map((pillar) => (
              <Link
                key={pillar.id}
                href={pillar.href}
                className={`px-4 py-2 rounded-full text-sm font-medium border min-h-[44px] flex items-center ${
                  params.category === pillar.category
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                {pillar.label}
              </Link>
            ))}
          </div>

          {posts.length > 0 ? (
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
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">
              {params.category
                ? `Belum ada artikel untuk topik "${params.category}". Cek kembali nanti atau jelajahi topik lain.`
                : 'Belum ada artikel blog yang dipublikasikan.'}
            </p>
          )}

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/blog?page=${p}${params.category ? `&category=${encodeURIComponent(params.category)}` : ''}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    p === page ? 'bg-blue-900 text-white' : 'border border-gray-300 text-gray-600'
                  }`}
                >
                  {p}
                </Link>
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
