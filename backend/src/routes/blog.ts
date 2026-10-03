import { Router, Request } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse, getPagination, paginatedResponse, param, slugify } from '../utils/helpers';
import { cacheService } from '../services/CacheService';
import { normalizeLocale, resolveBlogPost, ResolvedBlogPost, SiteLocale } from '../utils/blog-locale';

const router = Router();

/** Locale asked for by the request: ?locale, else Accept-Language, else 'id'. */
function requestLocale(req: Request): SiteLocale {
  return normalizeLocale(req.query.locale, req.headers['accept-language'] ?? null);
}

const PUBLISHED = {
  status: 'published' as const,
  deletedAt: null,
};

/**
 * A post reads in `locale` either because its own columns are written in that
 * language or because it carries a translation row for it. Both have to be
 * searchable, otherwise an /en visitor never finds a post whose English text
 * only exists in blog_post_translations.
 */
function textMatches(search: string, locale: SiteLocale) {
  return {
    OR: [
      { title: { contains: search } },
      { content: { contains: search } },
      {
        translations: {
          some: {
            locale,
            OR: [
              { title: { contains: search } },
              { content: { contains: search } },
              { excerpt: { contains: search } },
            ],
          },
        },
      },
    ],
  };
}

/**
 * Mirrors how `resolveBlogPost` picks a category: the base column when the base
 * row is already in the requested locale, otherwise the translation's category
 * when it has one, otherwise the base column again.
 */
function categoryMatches(category: string, locale: SiteLocale) {
  return {
    OR: [
      { locale, category },
      { locale: { not: locale }, translations: { some: { locale, category } } },
      {
        locale: { not: locale },
        category,
        translations: { none: { locale, category: { not: null } } },
      },
    ],
  };
}

const LIST_INCLUDE = {
  featuredImage: true,
  author: { select: { id: true, name: true } },
  translations: true,
} as const;

/** Keeps legacy rows with an empty slug clickable after locale resolution. */
function withSlugFallback(post: ResolvedBlogPost): ResolvedBlogPost {
  if (post.slug) return post;
  return { ...post, slug: slugify(String(post.title ?? '')) };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    const locale = requestLocale(req);
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>);
    const cacheKey = `blog:list:${locale}:${category || 'all'}:${page}:${pageSize}`;
    if (!search) {
      const cached = cacheService.get<{ posts: unknown[]; total: number }>(cacheKey);
      if (cached) return paginatedResponse(res, cached.posts, { page, pageSize, total: cached.total });
    }

    const and: Record<string, unknown>[] = [];
    if (category) and.push(categoryMatches(String(category), locale));
    if (search) and.push(textMatches(String(search), locale));

    const where: Record<string, unknown> = {
      ...PUBLISHED,
      publishedAt: { lte: new Date() },
      ...(and.length ? { AND: and } : {}),
    };

    const [rawPosts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: pageSize,
        include: LIST_INCLUDE,
      }),
      prisma.blogPost.count({ where }),
    ]);
    const posts = rawPosts.map((post) => withSlugFallback(resolveBlogPost(post, locale)));

    if (!search) cacheService.set(cacheKey, { posts, total }, 900);
    paginatedResponse(res, posts, { page, pageSize, total });
  })
);

router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const locale = requestLocale(req);
    const cacheKey = `blog:categories:${locale}`;
    const cached = cacheService.get<string[]>(cacheKey);
    if (cached) return successResponse(res, cached);

    const rows = await prisma.blogPost.findMany({
      where: {
        ...PUBLISHED,
        publishedAt: { lte: new Date() },
        OR: [
          { category: { not: null } },
          { translations: { some: { locale, category: { not: null } } } },
        ],
      },
      select: {
        locale: true,
        category: true,
        translations: { where: { locale }, select: { locale: true, category: true } },
      },
    });

    const categories = [...new Set(
      rows
        .map((row) => {
          if (row.locale === locale) return row.category?.trim();
          const translated = row.translations[0]?.category?.trim();
          return translated || row.category?.trim();
        })
        .filter((category): category is string => Boolean(category)),
    )].sort((a, b) => a.localeCompare(b, locale));

    cacheService.set(cacheKey, categories, 900);
    successResponse(res, categories);
  })
);

router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '');
    if (!q) return successResponse(res, []);
    const locale = requestLocale(req);

    const posts = await prisma.blogPost.findMany({
      where: {
        ...PUBLISHED,
        ...textMatches(q, locale),
      },
      take: 20,
      include: {
        featuredImage: true,
        author: { select: { name: true } },
        translations: true,
      },
    });

    successResponse(res, posts.map((post) => withSlugFallback(resolveBlogPost(post, locale))));
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const slug = param(req.params.slug);
    const locale = requestLocale(req);

    // The URL may carry the base row's slug or a translation's own slug.
    let post = await prisma.blogPost.findFirst({
      where: {
        ...PUBLISHED,
        publishedAt: { lte: new Date() },
        OR: [{ slug }, { translations: { some: { slug } } }],
      },
      include: LIST_INCLUDE,
    });

    // Older records may have been created before Unicode-safe slug generation
    // and have an empty slug. Resolve those records by the slug derived from
    // their title so existing public cards remain clickable.
    if (!post) {
      const legacyPosts = await prisma.blogPost.findMany({
        where: {
          slug: '',
          ...PUBLISHED,
          publishedAt: { lte: new Date() },
        },
        include: LIST_INCLUDE,
      });
      post = legacyPosts.find((candidate) => slugify(candidate.title) === slug) || null;
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Blog post not found' },
      });
    }

    // The counter belongs to the post, not to one of its language versions.
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    const related = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        category: post.category,
        id: { not: post.id },
        deletedAt: null,
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      include: { featuredImage: true, translations: true },
    });

    successResponse(res, {
      ...withSlugFallback(resolveBlogPost(post, locale)),
      relatedPosts: related.map((item) => withSlugFallback(resolveBlogPost(item, locale))),
    });
  })
);

export default router;
