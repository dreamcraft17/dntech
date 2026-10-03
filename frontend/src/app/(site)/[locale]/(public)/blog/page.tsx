import Image from 'next/image';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { PageIntro } from '@/components/layout/PageIntro';
import { JsonLd, breadcrumbSchema, itemListSchema } from '@/components/seo/JsonLd';
import { estimateReadTime } from '@/lib/read-time';
import { buildMetadata, getPageSeo, localePath, SITE_URL } from '@/lib/seo';
import { fetchPublicApiList, fetchPublicApiPaginated } from '@/lib/server-api';
import { getUploadUrl, withLocale } from '@/lib/api';
import type { LocalizedContentMeta } from '@/lib/api';
import type { BlogPost } from '@/types';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { PageEndCta } from '@/components/layout/PageEndCta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo('blog', locale);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: '/blog',
    keywords: seo.keywords,
    locale,
  });
}

type LocalizedBlogPost = BlogPost & LocalizedContentMeta;

async function getPosts(locale: string, page = 1, category?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: '9' });
  if (category) params.set('category', category);
  const { data, pagination } = await fetchPublicApiPaginated<LocalizedBlogPost>(
    withLocale(`/blog?${params}`, locale),
    60,
  );
  return { posts: data, pages: pagination?.pages || 1 };
}

async function getCategories(locale: string) {
  return fetchPublicApiList<string>(withLocale('/blog/categories', locale), 60);
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, format] = await Promise.all([getTranslations('catalog'), getFormatter()]);
  const query = await searchParams;
  const page = parseInt(query.page || '1', 10);
  const [{ posts, pages }, categories] = await Promise.all([
    getPosts(locale, page, query.category),
    getCategories(locale),
  ]);
  const base = `${SITE_URL}${localePath('/blog', locale)}`;

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: t('breadcrumb.home'), url: `${SITE_URL}${localePath('/', locale)}` },
        { name: t('breadcrumb.blog'), url: base },
      ])} />
      {posts.length > 0 && (
        <JsonLd data={itemListSchema(posts.map((p) => ({
          name: p.title,
          url: `${base}/${p.slug}`,
        })))} />
      )}

      <PublicPageShell>
          <PageIntro
            kicker={t('blog.kicker')}
            title={t('blog.title')}
            description={t('blog.description')}
          />

          <nav className="mb-10 mt-8 flex flex-wrap gap-x-6 gap-y-3 border-b border-slate-200" aria-label={t('blog.filterAria')}>
            <Link
              href="/blog"
              className={`border-b-2 pb-3 text-sm font-semibold ${
                !query.category ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('common.all')}
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`/blog?category=${encodeURIComponent(category)}`}
                className={`border-b-2 pb-3 text-sm font-semibold ${
                  query.category === category
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {category}
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
                        <div className="relative sm:row-span-2">
                          <Image
                            src={getUploadUrl(post.featuredImage.url)}
                            alt={post.featuredImage.altText || post.title}
                            width={1536}
                            height={1024}
                            className="h-auto w-full object-contain"
                            sizes="(min-width: 1024px) 16rem, 12rem"
                          />
                          <Image
                            src="/apple-icon.png"
                            alt=""
                            width={40}
                            height={40}
                            aria-hidden="true"
                            className="pointer-events-none absolute bottom-3 right-3 h-9 w-9 rounded-full shadow-lg ring-2 ring-white/80"
                          />
                        </div>
                      ) : <div className="hidden border-l-2 border-teal-600 sm:block" aria-hidden="true" />}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                          <span>{post.category}</span>
                          {post.isFallback && post.locale && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold tracking-normal text-slate-600 normal-case">
                              {t('blog.fallback.badge', { language: t(`blog.fallback.language.${post.locale === 'en' ? 'en' : 'id'}`) })}
                            </span>
                          )}
                        </div>
                        <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-950 sm:text-2xl">{post.title}</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
                      </div>
                      <div className="text-xs text-slate-500 sm:text-right">
                        {t('common.readTime', { minutes: readMin })}
                        {post.publishedAt && ` · ${format.dateTime(new Date(post.publishedAt), { year: 'numeric', month: 'long', day: 'numeric' })}`}
                        {post.author && ` · ${post.author.name}`}
                      </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="border-y border-slate-300 py-12 text-slate-500">
              {query.category
                ? t('blog.emptyForCategory', { category: query.category })
                : t('blog.empty')}
            </p>
          )}

          {pages > 1 && (
            <nav className="flex justify-center gap-2 mt-10" aria-label={t('blog.paginationAria')}>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/blog?page=${p}${query.category ? `&category=${encodeURIComponent(query.category)}` : ''}`}
                  aria-label={t('blog.pageAria', { page: p })}
                  aria-current={p === page ? 'page' : undefined}
                  className={`border px-4 py-2 text-sm font-medium ${
                    p === page ? 'border-blue-900 bg-blue-900 text-white' : 'border-gray-300 text-gray-600'
                  }`}
                >
                  {format.number(p)}
                </Link>
              ))}
            </nav>
          )}

          <PageEndCta />
      </PublicPageShell>
    </>
  );
}
