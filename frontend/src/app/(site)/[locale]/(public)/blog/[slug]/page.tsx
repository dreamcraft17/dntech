import Image from 'next/image';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { estimateReadTime } from '@/lib/read-time';
import { JsonLd, breadcrumbSchema, articleSchema } from '@/components/seo/JsonLd';
import { InternalLinks } from '@/components/seo/InternalLinks';
import { buildMetadata, localePath, SITE_URL } from '@/lib/seo';
import { getPillarForCategory, getRelatedServiceLinks } from '@/lib/content-pillars';
import { getUploadUrl } from '@/lib/api';
import { fetchPublicApiList, fetchPublicApiSafe } from '@/lib/server-api';
import { sanitizeHtml } from '@/lib/sanitize-html';
import type { BlogPost, Service } from '@/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';

type RouteParams = Promise<{ locale: string; slug: string }>;

async function getPost(slug: string) {
  return fetchPublicApiSafe<BlogPost>(`/blog/${slug}`, 60);
}

async function getServices() {
  return fetchPublicApiList<Service>('/services', 60);
}

function headingText(value: string) {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function headingSlug(value: string, index: number, used: Set<string>) {
  const base = headingText(value).toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const root = base || `bagian-${index + 1}`;
  let id = root;
  let suffix = 2;
  while (used.has(id)) id = `${root}-${suffix++}`;
  used.add(id);
  return id;
}

function prepareArticleContent(content: string | undefined) {
  const sanitized = sanitizeHtml(content);
  const headings: Array<{ id: string; label: string }> = [];
  const used = new Set<string>();
  const headingMatches = [...sanitized.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
  headingMatches.forEach((match, index) => {
    const label = headingText(match[1]);
    if (label) headings.push({ id: headingSlug(label, index, used), label });
  });

  let headingIndex = 0;
  const html = sanitized.replace(/<h2\b([^>]*)>/gi, (tag, attributes: string) => {
    const heading = headings[headingIndex++];
    if (!heading) return tag;
    const withoutId = attributes.replace(/\s+id\s*=\s*(["']).*?\1/gi, '');
    return `<h2${withoutId} id="${heading.id}">`;
  });
  return { html, headings };
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'catalog' });
  const post = await getPost(slug);
  if (!post) return { title: t('blog.metadataFallback') };
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || '',
    path: `/blog/${slug}`,
    keywords: [...(post.tags || []), post.category || ''].filter(Boolean) as string[],
    type: 'article',
    publishedTime: post.publishedAt,
    author: post.author?.name,
    image: post.featuredImage?.url ? getUploadUrl(post.featuredImage.url) : undefined,
    locale,
  });
}

export default async function BlogDetailPage({ params }: { params: RouteParams }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, format] = await Promise.all([getTranslations('catalog'), getFormatter()]);
  const [post, services] = await Promise.all([getPost(slug), getServices()]);
  if (!post) notFound();

  const pillar = getPillarForCategory(post.category);
  const relatedServices = getRelatedServiceLinks(post.category, services);
  const internalLinks = [
    ...(pillar?.links ?? []),
    ...relatedServices,
  ].map((link) => ({ ...link, href: localePath(link.href, locale) }));
  const readMin = estimateReadTime(post.content || post.excerpt);
  const isPeopleArticle = /hr|people|karyawan|absen|cuti|payroll/i.test(`${post.category || ''} ${post.title}`);
  const articleContent = prepareArticleContent(post.content);
  const blogUrl = `${SITE_URL}${localePath('/blog', locale)}`;

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: t('breadcrumb.home'), url: `${SITE_URL}${localePath('/', locale)}` },
        { name: t('breadcrumb.blog'), url: blogUrl },
        { name: post.title, url: `${blogUrl}/${slug}` },
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

      <div className="saas-page article-page-bg py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500" aria-label={t('breadcrumb.aria')}>
            <Link href="/" className="hover:text-blue-900">{t('breadcrumb.home')}</Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog" className="hover:text-blue-900">{t('breadcrumb.blog')}</Link>
            {post.category && (
              <>
                <span aria-hidden="true">/</span>
                <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-blue-900">{post.category}</Link>
              </>
            )}
          </nav>

          <article itemScope itemType="https://schema.org/Article">
            <header className="article-hero-grid">
              <div className="article-hero-copy">
                <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-teal-700">
                  {post.category && <span>{post.category}</span>}
                  <span className="h-1 w-1 rounded-full bg-teal-500" aria-hidden="true" />
                  <span className="font-medium text-gray-500">{t('common.readTime', { minutes: readMin })}</span>
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.06] tracking-[-0.035em] text-gray-950 sm:text-6xl" itemProp="headline">{post.title}</h1>
                {post.excerpt && <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600" itemProp="description">{post.excerpt}</p>}
                <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-gray-200 pt-5 text-sm text-gray-500">
                  {post.publishedAt && (
                    <time itemProp="datePublished" dateTime={post.publishedAt}>
                      {format.dateTime(new Date(post.publishedAt), { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                  )}
                  {post.author && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span itemProp="author">{t('blog.detail.byAuthor', { name: post.author.name })}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="article-hero-media relative">
                {post.featuredImage?.url ? (
                  <>
                    <Image
                      src={getUploadUrl(post.featuredImage.url)}
                      alt={post.featuredImage.altText || post.title}
                      width={1536}
                      height={1024}
                      quality={85}
                      priority
                      className="block h-auto w-full object-contain"
                      sizes="(min-width: 1024px) 48vw, 100vw"
                      itemProp="image"
                    />
                    <Image
                      src="/apple-icon.png"
                      alt=""
                      width={56}
                      height={56}
                      aria-hidden="true"
                      className="article-hero-logo pointer-events-none absolute bottom-5 right-5 h-12 w-12 rounded-full shadow-lg ring-2 ring-white/80"
                    />
                  </>
                ) : (
                  <div className="flex h-full min-h-[280px] items-end bg-blue-950 p-7 text-white">
                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-300">{t('blog.detail.heroFallback')}</span>
                  </div>
                )}
              </div>
            </header>

            <div className="article-reading-surface">
              <div className="article-reading-grid">
                {articleContent.headings.length >= 2 && (
                  <aside className="article-toc" aria-label={t('blog.detail.tocAria')}>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">{t('blog.detail.tocTitle')}</p>
                    <nav className="mt-4 border-l border-gray-200 pl-4">
                      {articleContent.headings.map((heading) => (
                        <a key={heading.id} href={`#${heading.id}`} className="article-toc-link">{heading.label}</a>
                      ))}
                    </nav>
                  </aside>
                )}

                <div className="min-w-0">
                  {post.excerpt && <p className="article-lead" itemProp="description">{post.excerpt}</p>}
                  <div className="article-body" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: articleContent.html }} />

                  <div className="article-cta mt-14">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-300">{t('blog.detail.ctaKicker')}</p>
                {isPeopleArticle ? (
                  <>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight">{t('blog.detail.ctaPeopleTitle')}</h2>
                    <p className="mt-2 max-w-2xl text-blue-100">{t('blog.detail.ctaPeopleBody')}</p>
                    <Link href="/products/dnpeople" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-2.5 font-semibold text-blue-950 transition hover:bg-blue-50">{t('blog.detail.ctaPeopleAction')} <span className="ml-2" aria-hidden="true">→</span></Link>
                  </>
                ) : (
                  <>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight">{t('blog.detail.ctaGenericTitle')}</h2>
                    <p className="mt-2 max-w-2xl text-blue-100">{t('blog.detail.ctaGenericBody')}</p>
                    <Link href="/contact" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-2.5 font-semibold text-blue-950 transition hover:bg-blue-50">{t('blog.detail.ctaGenericAction')} <span className="ml-2" aria-hidden="true">→</span></Link>
                  </>
                )}
                  </div>
                </div>
              </div>
            </div>
          </article>

          <div className="mt-10">
            <InternalLinks
              title={t('blog.detail.exploreTitle')}
              description={t('blog.detail.exploreDescription')}
              links={internalLinks}
            />
          </div>

          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <div className="mt-10 border-t border-gray-200 pt-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('common.relatedArticles')}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {post.relatedPosts.map((related) => (
                  <Link key={related.id} href={`/blog/${related.slug}`}
                    className="group rounded-xl border border-gray-200 bg-white transition-colors hover:border-blue-300">
                    {related.featuredImage?.url && (
                      <Image
                        src={getUploadUrl(related.featuredImage.url)}
                        alt={related.featuredImage.altText || related.title}
                        width={1536}
                        height={1024}
                        className="block h-auto w-full rounded-t-xl object-contain"
                        sizes="(min-width: 640px) 33vw, 100vw"
                      />
                    )}
                    <div className="p-4"><div className="font-semibold leading-6 text-gray-900">{related.title}</div><span className="mt-3 inline-block text-sm font-semibold text-blue-900">{t('blog.detail.readArticle')}</span></div>
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
