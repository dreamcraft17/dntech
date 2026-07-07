import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { JsonLd, breadcrumbSchema, articleSchema } from '@/components/seo/JsonLd';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { getPillarForCategory, getRelatedServiceLinks } from '@/lib/content-pillars';
import { asArray } from '@/lib/api';
import type { BlogPost, Service } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getPost(slug: string) {
  try {
    const res = await fetch(`${API_URL}/blog/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data as BlogPost;
  } catch {
    return null;
  }
}

async function getServices() {
  try {
    const res = await fetch(`${API_URL}/services`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return asArray<Service>((await res.json()).data);
  } catch {
    return [];
  }
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
    image: post.featuredImage?.url,
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
        image: post.featuredImage?.url,
        category: post.category,
      })} />

      <div className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-slate-500 mb-8" aria-label="Jejak navigasi">
            <Link href="/" className="hover:text-blue-600">Beranda</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            {post.category && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/blog?category=${post.category}`} className="hover:text-blue-600">{post.category}</Link>
              </>
            )}
          </nav>

          <article itemScope itemType="https://schema.org/Article">
            <div className="text-sm text-blue-600 font-medium">{post.category}</div>
            <h1 className="mt-2 text-4xl font-bold text-slate-900" itemProp="headline">{post.title}</h1>
            <div className="mt-4 text-sm text-slate-500">
              {post.publishedAt && <time itemProp="datePublished" dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
              {post.author && <span itemProp="author"> · {post.author.name}</span>}
            </div>

            {post.featuredImage?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.featuredImage.url} alt={post.title} className="mt-8 w-full rounded-xl" loading="lazy" itemProp="image" />
            )}

            <div className="mt-8 prose max-w-none" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
          </article>

          <div className="mt-10">
            <InternalLinks
              title="Lanjutkan Menjelajah"
              description="Layanan dan sumber daya terkait topik ini"
              links={internalLinks}
            />
          </div>

          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <div className="mt-10 border-t border-slate-200 pt-10">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Artikel Terkait</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {post.relatedPosts.map((related) => (
                  <Link key={related.id} href={`/blog/${related.slug}`}
                    className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                    <div className="font-medium text-slate-900 text-sm">{related.title}</div>
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
