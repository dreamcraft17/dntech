import Link from 'next/link';
import Image from 'next/image';
import { PageIntro } from '@/components/layout/PageIntro';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { formatDate } from '@/lib/utils';
import { estimateReadTime, formatReadTime } from '@/lib/read-time';
import { buildMetadata, PAGE_SEO, SITE_URL } from '@/lib/seo';
import { CONTENT_PILLARS } from '@/lib/content-pillars';
import { fetchPublicApiPaginated } from '@/lib/server-api';
import { getUploadUrl } from '@/lib/api';
import type { BlogPost } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.blog.title,
  description: PAGE_SEO.blog.description,
  path: '/blog',
  keywords: PAGE_SEO.blog.keywords,
});

async function getPosts(page = 1, category?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: '9' });
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
          <PageIntro
            kicker="Wawasan"
            title="Blog & Wawasan"
            description="Panduan tech stack, scaling software, dan saran untuk founder startup Indonesia."
          />

          <nav className="mb-10 mt-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-slate-200" aria-label="Filter topik blog">
            <Link
              href="/blog"
              className={`border-b-2 pb-3 text-sm font-semibold ${
                !params.category ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Semua
            </Link>
            {CONTENT_PILLARS.map((pillar) => (
              <Link
                key={pillar.id}
                href={pillar.href}
                className={`border-b-2 pb-3 text-sm font-semibold ${
                  params.category === pillar.category
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {pillar.label}
              </Link>
            ))}
          </nav>

          {posts.length > 0 ? (
            <div className="border-t border-slate-300">
              {posts.map((post) => {
                const readMin = estimateReadTime(post.content || post.excerpt);
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group grid gap-6 border-b border-slate-300 py-7 transition-colors hover:bg-slate-50 sm:grid-cols-[12rem_1fr] sm:px-3 lg:grid-cols-[16rem_1fr_12rem]">
                      {post.featuredImage?.url ? (
                        <Image
                          src={getUploadUrl(post.featuredImage.url)}
                          alt={post.featuredImage.altText || post.title}
                          width={1536}
                          height={1024}
                          className="h-auto w-full object-contain sm:row-span-2"
                          sizes="(min-width: 1024px) 16rem, 12rem"
                        />
                      ) : <div className="hidden border-l-2 border-teal-600 sm:block" aria-hidden="true" />}
                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{post.category}</div>
                        <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-950 sm:text-2xl">{post.title}</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                      </div>
                      <div className="text-xs text-slate-500 sm:text-right">
                        {formatReadTime(readMin)}
                        {post.publishedAt && ` · ${formatDate(post.publishedAt)}`}
                        {post.author && ` · ${post.author.name}`}
                      </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="border-y border-slate-300 py-12 text-slate-500">
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
                  className={`border px-4 py-2 text-sm font-medium ${
                    p === page ? 'border-blue-900 bg-blue-900 text-white' : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-16 border-l-2 border-teal-600 pl-5">
            <p className="font-semibold text-slate-900">Ingin menerapkan apa yang Anda baca?</p>
            <div className="mt-3 flex flex-wrap gap-5 text-sm">
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
