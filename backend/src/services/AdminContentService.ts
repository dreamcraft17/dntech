import { z } from 'zod';
import prisma from '../config/database';
import { slugify, param, AppError } from '../utils/helpers';
import { logActivity } from '../middleware/auth';
import { cacheService } from '../services/CacheService';
import {
  SITE_LOCALES,
  DEFAULT_LOCALE,
  isSiteLocale,
  uniqueTranslationSlug,
  type SiteLocale,
} from '../utils/blog-locale';
import { translateBlogPost } from './GeminiContentService';

/**
 * Admin CRUD logic for the "big 4" CMS content types (services, products,
 * portfolio items, blog posts) that were previously inlined in
 * backend/src/routes/admin.ts. Extracted 1:1 — behavior, response shapes,
 * and the (sometimes inconsistent) cache-invalidation / activity-logging
 * calls are preserved exactly as they existed in the route file.
 */

// --- Services ---
export const serviceSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().optional(),
  description: z.string().min(10),
  features: z.array(z.object({ title: z.string(), description: z.string().optional() })).optional(),
  iconUrl: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  displayOrder: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function listServices(query: Record<string, unknown>) {
  const { status, category, search } = query;
  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = String(status);
  if (category) where.category = String(category);
  if (search) where.name = { contains: String(search) };

  return prisma.service.findMany({ where, orderBy: { displayOrder: 'asc' } });
}

export async function createService(body: unknown, userId: string, ip?: string) {
  const data = serviceSchema.parse(body);
  const slug = data.slug || slugify(data.name);

  const service = await prisma.service.create({
    data: { ...data, slug, createdById: userId },
  });
  await logActivity(userId, 'create', 'service', service.id, data, ip);
  cacheService.clear();
  return service;
}

export async function updateService(id: string, body: unknown, userId: string, ip?: string) {
  const data = serviceSchema.partial().parse(body);
  const service = await prisma.service.update({ where: { id: param(id) }, data });
  await logActivity(userId, 'update', 'service', service.id, data, ip);
  cacheService.clear();
  return service;
}

export async function deleteService(id: string, userId: string, ip?: string) {
  await prisma.service.update({
    where: { id: param(id) },
    data: { deletedAt: new Date(), status: 'archived' },
  });
  await logActivity(userId, 'delete', 'service', param(id), undefined, ip);
  cacheService.clear();
}

export async function reorderServices(body: unknown) {
  const { ids } = z.object({ ids: z.array(z.string()) }).parse(body);
  await Promise.all(ids.map((id, index) =>
    prisma.service.update({ where: { id }, data: { displayOrder: index } })
  ));
  cacheService.clear();
}

export async function publishService(id: string) {
  const service = await prisma.service.update({
    where: { id: param(id) },
    data: { status: 'active' },
  });
  cacheService.clear();
  return service;
}

export async function unpublishService(id: string) {
  const service = await prisma.service.update({
    where: { id: param(id) },
    data: { status: 'draft' },
  });
  cacheService.clear();
  return service;
}

// --- Products ---
export const productSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().optional(),
  description: z.string().min(10),
  features: z.any().optional(),
  iconUrl: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  displayOrder: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),

  tagline: z.string().optional(),
  heroImage: z.string().optional(),
  heroAlt: z.string().optional(),
  logoUrl: z.string().optional(),
  screenshotUrls: z.any().optional(),
  keywords: z.string().optional(),
  canonical: z.string().optional(),
  featured: z.boolean().optional(),
  showOnHomepage: z.boolean().optional(),
  publishedAt: z.string().optional(),
  launchStatus: z.enum(['launched', 'beta', 'coming_soon']).optional(),
  freemiumEnabled: z.boolean().optional(),
  freeLimit: z.string().optional(),
  trialDays: z.number().optional(),
  customerCount: z.string().optional(),
  techStack: z.any().optional(),
  pricingTiers: z.any().optional(),
  integrations: z.any().optional(),
  useCases: z.any().optional(),
  testimonials: z.any().optional(),
  caseStudies: z.any().optional(),
  comparisonTable: z.any().optional(),
  roadmap: z.any().optional(),
  primaryCta: z.any().optional(),
  secondaryCtas: z.any().optional(),
  pricingCalcUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  longFormContent: z.string().optional(),
  faq: z.any().optional(),
});

export async function listProducts(query: Record<string, unknown>) {
  const { status, category, search } = query;
  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = String(status);
  if (category) where.category = String(category);
  if (search) where.name = { contains: String(search) };

  return prisma.product.findMany({ where, orderBy: { displayOrder: 'asc' } });
}

export async function createProduct(body: unknown, userId: string, ip?: string) {
  const data = productSchema.parse(body);
  const slug = data.slug || slugify(data.name);

  const product = await prisma.product.create({
    data: { ...data, slug, publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined, createdById: userId },
  });
  await logActivity(userId, 'create', 'product', product.id, data, ip);
  cacheService.clear();
  return product;
}

export async function updateProduct(id: string, body: unknown, userId: string, ip?: string) {
  const data = productSchema.partial().parse(body);
  const product = await prisma.product.update({
    where: { id: param(id) },
    data: { ...data, publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined },
  });
  await logActivity(userId, 'update', 'product', product.id, data, ip);
  cacheService.clear();
  return product;
}

export async function deleteProduct(id: string, userId: string, ip?: string) {
  await prisma.product.update({
    where: { id: param(id) },
    data: { deletedAt: new Date(), status: 'archived' },
  });
  await logActivity(userId, 'delete', 'product', param(id), undefined, ip);
  cacheService.clear();
}

export async function reorderProducts(body: unknown) {
  const { ids } = z.object({ ids: z.array(z.string()) }).parse(body);
  await Promise.all(ids.map((id, index) =>
    prisma.product.update({ where: { id }, data: { displayOrder: index } })
  ));
  cacheService.clear();
}

// --- Portfolio ---
// NOTE: the original routes never called cacheService.clear() for portfolio
// mutations — preserved as-is (not a bug we're asked to fix here).
export const portfolioSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  clientName: z.string().optional(),
  industries: z.array(z.string()).optional(),
  serviceIds: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
  outcomes: z.string().optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  metrics: z.record(z.string(), z.string()).optional(),
  clientLogoUrl: z.string().optional(),
  testimonial: z.string().optional(),
  featuredImageId: z.string().optional(),
  imageIds: z.array(z.string()).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  displayOrder: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function listPortfolioItems(query: Record<string, unknown>) {
  const { status, search } = query;
  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = String(status);
  if (search) where.title = { contains: String(search) };

  return prisma.portfolioItem.findMany({
    where,
    orderBy: { displayOrder: 'asc' },
    include: { featuredImage: true },
  });
}

export async function createPortfolioItem(body: unknown, userId: string, ip?: string) {
  const data = portfolioSchema.parse(body);
  const slug = data.slug || slugify(data.title);
  const item = await prisma.portfolioItem.create({
    data: {
      ...data,
      slug,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      createdById: userId,
    },
    include: { featuredImage: true },
  });
  await logActivity(userId, 'create', 'portfolio', item.id, data, ip);
  return item;
}

export async function updatePortfolioItem(id: string, body: unknown, userId: string, ip?: string) {
  const data = portfolioSchema.partial().parse(body);
  const item = await prisma.portfolioItem.update({
    where: { id: param(id) },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
    include: { featuredImage: true },
  });
  await logActivity(userId, 'update', 'portfolio', item.id, data, ip);
  return item;
}

export async function deletePortfolioItem(id: string) {
  await prisma.portfolioItem.update({
    where: { id: param(id) },
    data: { deletedAt: new Date() },
  });
}

// --- Blog ---
// NOTE: the original PATCH/publish/delete routes never called logActivity()
// (only POST did) — preserved as-is (not a bug we're asked to fix here).
export const blogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  content: z.string().min(100),
  excerpt: z.string().optional(),
  featuredImageId: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'scheduled']).optional(),
  publishedAt: z.string().optional(),
  scheduledAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  // Language the base row's own columns are written in. Never left to the
  // column default silently: created posts are explicitly stamped.
  locale: z.enum(SITE_LOCALES).optional(),
});

export async function listBlogPosts(query: Record<string, unknown>) {
  const { status, category, search } = query;
  const where: Record<string, unknown> = { deletedAt: null };
  if (status) where.status = String(status);
  if (category) where.category = String(category);
  if (search) where.title = { contains: String(search) };

  return prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { featuredImage: true, author: { select: { name: true } } },
  });
}

export async function createBlogPost(body: unknown, userId: string, ip?: string) {
  const data = blogSchema.parse(body);
  const slug = data.slug || slugify(data.title);
  const post = await prisma.blogPost.create({
    data: {
      ...data,
      slug,
      locale: data.locale ?? DEFAULT_LOCALE,
      authorId: userId,
      publishedAt: data.publishedAt
        ? new Date(data.publishedAt)
        : data.status === 'published'
          ? new Date()
          : undefined,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
    include: { featuredImage: true },
  });
  await logActivity(userId, 'create', 'blog', post.id, data, ip);
  cacheService.clear();
  return post;
}

export async function updateBlogPost(id: string, body: unknown) {
  const data = blogSchema.partial().parse(body);

  let publishedAt = data.publishedAt ? new Date(data.publishedAt) : undefined;
  if (data.status === 'published' && !data.publishedAt) {
    const existing = await prisma.blogPost.findUnique({
      where: { id: param(id) },
      select: { publishedAt: true },
    });
    publishedAt = existing?.publishedAt ?? new Date();
  }

  // Moving the base row into a locale that already has a translation would
  // leave two rows claiming the same language for the same post.
  if (data.locale) {
    const clash = await prisma.blogPostTranslation.findUnique({
      where: { postId_locale: { postId: param(id), locale: data.locale } },
      select: { id: true },
    });
    if (clash) {
      throw new AppError(
        409,
        'LOCALE_CONFLICT',
        `This post already has a ${data.locale} translation; delete it before making ${data.locale} the base locale`
      );
    }
  }

  const post = await prisma.blogPost.update({
    where: { id: param(id) },
    data: {
      ...data,
      publishedAt,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    },
    include: { featuredImage: true },
  });
  cacheService.clear();
  return post;
}

export async function publishBlogPost(id: string) {
  const post = await prisma.blogPost.update({
    where: { id: param(id) },
    data: { status: 'published', publishedAt: new Date() },
  });
  cacheService.clear();
  return post;
}

export async function unpublishBlogPost(id: string) {
  const post = await prisma.blogPost.update({
    where: { id: param(id) },
    data: { status: 'draft' },
  });
  cacheService.clear();
  return post;
}

export async function deleteBlogPost(id: string) {
  await prisma.blogPost.update({ where: { id: param(id) }, data: { deletedAt: new Date() } });
  cacheService.clear();
}

// --- Blog translations ---
// A post is one base row (written in BlogPost.locale) plus one
// BlogPostTranslation per other site locale. Machine output can be
// overwritten freely; anything an editor has touched (isMachine === false)
// is only replaced when the caller explicitly asks for it.

export const blogTranslationSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  content: z.string().min(1),
  excerpt: z.string().nullish(),
  category: z.string().nullish(),
  tags: z.array(z.string()).nullish(),
  seoTitle: z.string().nullish(),
  seoDescription: z.string().nullish(),
});

/** Minimal surface of a Prisma client, so scripts can pass their own. */
export interface BlogSlugLookupClient {
  blogPost: { findFirst(args: unknown): Promise<{ id: string } | null> };
  blogPostTranslation: {
    findFirst(args: unknown): Promise<{ postId: string; locale: string } | null>;
  };
}

/**
 * A translation slug has to be unique against both `blog_posts.slug` and
 * `blog_post_translations.slug`. The row being written is allowed to keep its
 * own slug.
 */
export function makeTranslationSlugChecker(
  db: BlogSlugLookupClient,
  postId: string,
  locale: string
) {
  return async (candidate: string): Promise<boolean> => {
    const base = await db.blogPost.findFirst({
      where: { slug: candidate },
      select: { id: true },
    });
    if (base) return true;

    const translation = await db.blogPostTranslation.findFirst({
      where: { slug: candidate },
      select: { postId: true, locale: true },
    });
    if (!translation) return false;
    return !(translation.postId === postId && translation.locale === locale);
  };
}

function assertSiteLocale(locale: string): SiteLocale {
  if (!isSiteLocale(locale)) {
    throw new AppError(
      400,
      'UNSUPPORTED_LOCALE',
      `Unsupported locale "${locale}"; expected one of ${SITE_LOCALES.join(', ')}`
    );
  }
  return locale;
}

async function getPostForTranslation(id: string) {
  const post = await prisma.blogPost.findFirst({
    where: { id: param(id), deletedAt: null },
  });
  if (!post) throw new AppError(404, 'NOT_FOUND', 'Blog post not found');
  return post;
}

export async function listBlogTranslations(id: string) {
  const post = await prisma.blogPost.findFirst({
    where: { id: param(id), deletedAt: null },
    include: { translations: { orderBy: { locale: 'asc' } } },
  });
  if (!post) throw new AppError(404, 'NOT_FOUND', 'Blog post not found');

  const baseLocale = post.locale || DEFAULT_LOCALE;
  const present = new Set<string>([baseLocale, ...post.translations.map((t) => t.locale)]);

  return {
    postId: post.id,
    baseLocale,
    base: {
      locale: baseLocale,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
    },
    siteLocales: [...SITE_LOCALES],
    missingLocales: SITE_LOCALES.filter((locale) => !present.has(locale)),
    translations: post.translations,
  };
}

export async function upsertBlogTranslation(
  id: string,
  locale: string,
  body: unknown,
  userId: string,
  ip?: string
) {
  const target = assertSiteLocale(locale);
  const data = blogTranslationSchema.parse(body);
  const post = await getPostForTranslation(id);

  if ((post.locale || DEFAULT_LOCALE) === target) {
    throw new AppError(
      400,
      'LOCALE_CONFLICT',
      `${target} is this post's base locale; edit the post itself instead`
    );
  }

  const slug = await uniqueTranslationSlug(
    slugify(data.slug || data.title),
    makeTranslationSlugChecker(prisma as unknown as BlogSlugLookupClient, post.id, target)
  );

  const payload = {
    title: data.title,
    slug,
    content: data.content,
    excerpt: data.excerpt ?? null,
    category: data.category ?? null,
    tags: data.tags ?? undefined,
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
    // A human has touched this row; the backfill and the generator must not
    // silently overwrite it from now on.
    isMachine: false,
  };

  const translation = await prisma.blogPostTranslation.upsert({
    where: { postId_locale: { postId: post.id, locale: target } },
    create: { ...payload, postId: post.id, locale: target },
    update: payload,
  });

  await logActivity(userId, 'update', 'blog_translation', translation.id, { postId: post.id, locale: target }, ip);
  cacheService.clear();
  return translation;
}

export async function generateBlogTranslation(
  id: string,
  locale: string,
  body: unknown,
  userId: string,
  ip?: string
) {
  const target = assertSiteLocale(locale);
  const { force } = z.object({ force: z.boolean().optional() }).parse(body ?? {});
  const post = await getPostForTranslation(id);
  const sourceLocale = post.locale || DEFAULT_LOCALE;

  if (sourceLocale === target) {
    throw new AppError(
      400,
      'LOCALE_CONFLICT',
      `${target} is this post's base locale; nothing to translate`
    );
  }

  const existing = await prisma.blogPostTranslation.findUnique({
    where: { postId_locale: { postId: post.id, locale: target } },
  });
  if (existing && existing.isMachine === false && !force) {
    throw new AppError(
      409,
      'HUMAN_TRANSLATION_EXISTS',
      'This translation was edited by a human; pass { "force": true } to overwrite it'
    );
  }

  const result = await translateBlogPost({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: Array.isArray(post.tags) ? (post.tags as string[]) : null,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    sourceLocale,
    targetLocale: target,
  });

  const slug = await uniqueTranslationSlug(
    slugify(result.slug || result.title),
    makeTranslationSlugChecker(prisma as unknown as BlogSlugLookupClient, post.id, target)
  );

  const payload = {
    title: result.title,
    slug,
    content: result.content,
    excerpt: result.excerpt ?? null,
    category: result.category ?? null,
    tags: result.tags ?? undefined,
    seoTitle: result.seoTitle ?? null,
    seoDescription: result.seoDescription ?? null,
    isMachine: true,
  };

  const translation = await prisma.blogPostTranslation.upsert({
    where: { postId_locale: { postId: post.id, locale: target } },
    create: { ...payload, postId: post.id, locale: target },
    update: payload,
  });

  await logActivity(
    userId,
    'generate',
    'blog_translation',
    translation.id,
    { postId: post.id, locale: target, sourceLocale, overwroteHumanEdit: Boolean(existing && !existing.isMachine) },
    ip
  );
  cacheService.clear();
  return translation;
}

export async function deleteBlogTranslation(id: string, locale: string, userId: string, ip?: string) {
  const target = assertSiteLocale(locale);
  const existing = await prisma.blogPostTranslation.findUnique({
    where: { postId_locale: { postId: param(id), locale: target } },
    select: { id: true },
  });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Translation not found');

  await prisma.blogPostTranslation.delete({ where: { id: existing.id } });
  await logActivity(userId, 'delete', 'blog_translation', existing.id, { postId: param(id), locale: target }, ip);
  cacheService.clear();
}
