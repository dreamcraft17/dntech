import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { estimateReadTime, formatReadTime } from '@/lib/read-time';
import { JsonLd, breadcrumbSchema, articleSchema } from '@/components/seo/JsonLd';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { getPillarForCategory, getRelatedServiceLinks } from '@/lib/content-pillars';
import { getUploadUrl } from '@/lib/api';
import { fetchPublicApiList, fetchPublicApiSafe } from '@/lib/server-api';
import { sanitizeHtml } from '@/lib/sanitize-html';
import type { BlogPost, Service } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

async function getPost(slug: string) {
  return fetchPublicApiSafe<BlogPost>(`/blog/${slug}`, 60);
}

async function getServices() {
  return fetchPublicApiList<Service>('/services', 60);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Artikel Blog' };
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || '',
    path: `/blog/${slug}`,
    keywords: [...(post.tags || []), post.category || ''].filter(Boolean) as string[],
    type: 'article',
    publishedTime: post.publishedAt,
    author: post.author?.name,
    image: post.featuredImage?.url ? getUploadUrl(post.featuredImage.url) : undefined,
  });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, services] = await Promise.all([getPost(slug), getServices()]);
  if (!post) notFound();

  const pillar = getPillarForCategory(post.category);
  const relatedServices = getRelatedServiceLinks(post.category, services);
  const internalLinks = [
    ...(pillar?.links ?? []),
    ...relatedServices,
  ];
  const readMin = estimateReadTime(post.content || post.excerpt);
  const isPeopleArticle = /hr|people|karyawan|absen|cuti|payroll/i.test(`${post.category || ''} ${post.title}`);

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Beranda', url: SITE_URL },
        { name: 'Blog', url: `${SITE_URL}/blog` },
        { name: post.title, url: `${SITE_URL}/blog/${slug}` },
      ])} />
      <JsonLd data={articleSchema({
        title: post.title,
        description: post.excerpt,
        slug,
        publishedAt: post.publishedAt,
        author: post.author?.name,
        image: post.featuredImage?.url ? getUploadUrl(post.featuredImage.url) : undefined,
        category: post.category,
      })} />

      <div className="bg-slate-50 py-10 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm text-gray-500" aria-label="Jejak navigasi">
            <Link href="/" className="hover:text-blue-900">Beranda</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-blue-900">Blog</Link>
            {post.category && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/blog?category=${post.category}`} className="hover:text-blue-900">{post.category}</Link>
              </>
            )}
          </nav>

          <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm" itemScope itemType="https://schema.org/Article">
            <div className="px-6 py-9 sm:px-12 sm:py-12">
              {post.category && (
                <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-900">
                  {post.category}
                </div>
              )}
              <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-gray-950 sm:text-5xl" itemProp="headline">{post.title}</h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
                <span>{formatReadTime(readMin)}</span>
                {post.publishedAt && <><span aria-hidden="true">·</span><time itemProp="datePublished" dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></>}
                {post.author && <><span aria-hidden="true">·</span><span itemProp="author">{post.author.name}</span></>}
              </div>
            </div>

            {post.featuredImage?.url && (
              <Image
                src={getUploadUrl(post.featuredImage.url)}
                alt={post.featuredImage.altText || post.title}
                width={1280}
                height={720}
                quality={85}
                priority
                className="aspect-video w-full object-cover"
                sizes="(min-width: 1024px) 960px, 100vw"
                itemProp="image"
              />
            )}

            <div className="px-6 py-9 sm:px-12 sm:py-12">
              {post.excerpt && (
                <p className="article-lead" itemProp="description">{post.excerpt}</p>
              )}
              <div className="article-body" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }} />

              <div className="mt-12 rounded-2xl bg-blue-950 px-6 py-7 text-white sm:px-8">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-300">Lanjutkan ke solusi</p>
                {isPeopleArticle ? (
                  <>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight">Sudah waktunya HR bekerja lebih rapi?</h2>
                    <p className="mt-2 max-w-2xl text-blue-100">Lihat bagaimana dnPeople membantu tim mengelola data karyawan, absensi, cuti, dan proses HR dalam satu tempat.</p>
                    <Link href="/products/dnpeople" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-2.5 font-semibold text-blue-950 transition hover:bg-blue-50">Lihat dnPeople <span className="ml-2" aria-hidden="true">→</span></Link>
                  </>
                ) : (
                  <>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight">Punya workflow yang ingin dirapikan?</h2>
                    <p className="mt-2 max-w-2xl text-blue-100">Ceritakan kebutuhan bisnis dan sistem yang sedang dipakai. Tim DN Tech akan membantu memetakan langkah yang paling masuk akal.</p>
                    <Link href="/contact" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-2.5 font-semibold text-blue-950 transition hover:bg-blue-50">Konsultasi dengan DN Tech <span className="ml-2" aria-hidden="true">→</span></Link>
                  </>
                )}
              </div>
            </div>
          </article>

          <div className="mt-10">
            <InternalLinks
              title="Lanjutkan Menjelajah"
              description="Layanan dan sumber daya terkait topik ini"
              links={internalLinks}
            />
          </div>

          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <div className="mt-10 border-t border-gray-200 pt-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Artikel Terkait</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {post.relatedPosts.map((related) => (
                  <Link key={related.id} href={`/blog/${related.slug}`}
                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="font-medium text-gray-900 text-sm">{related.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
