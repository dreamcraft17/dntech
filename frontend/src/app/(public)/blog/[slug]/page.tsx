import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { BlogPost } from '@/types';
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post?.title, description: post?.excerpt };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-slate-500 mb-8">
          <Link href="/blog" className="hover:text-blue-600">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{post.title}</span>
        </nav>

        <div className="text-sm text-blue-600 font-medium">{post.category}</div>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">{post.title}</h1>
        <div className="mt-4 text-sm text-slate-500">
          {post.publishedAt && formatDate(post.publishedAt)}
          {post.author && ` · By ${post.author.name}`}
        </div>

        <div className="mt-8 prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content || '' }} />

        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <div className="mt-16 border-t border-slate-200 pt-10">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Related Posts</h2>
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

        <div className="mt-16 p-6 rounded-xl bg-blue-50 border border-blue-100">
          <h3 className="font-semibold text-slate-900">Need help implementing this?</h3>
          <p className="mt-2 text-sm text-slate-600">Explore our services or see how we helped similar clients.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/services" className="text-sm text-blue-600 font-medium hover:underline">View Services →</Link>
            <Link href="/case-studies" className="text-sm text-blue-600 font-medium hover:underline">Case Studies →</Link>
            <Link href="/contact" className="text-sm text-blue-600 font-medium hover:underline">Contact Us →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
