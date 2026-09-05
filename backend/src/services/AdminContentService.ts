import { z } from 'zod';
import prisma from '../config/database';
import { slugify, param } from '../utils/helpers';
import { logActivity } from '../middleware/auth';
import { cacheService } from '../services/CacheService';

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
      authorId: userId,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
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
  const post = await prisma.blogPost.update({
    where: { id: param(id) },
    data: {
      ...data,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
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

export async function deleteBlogPost(id: string) {
  await prisma.blogPost.update({ where: { id: param(id) }, data: { deletedAt: new Date() } });
  cacheService.clear();
}
