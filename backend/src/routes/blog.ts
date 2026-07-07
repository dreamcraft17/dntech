import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse, getPagination, paginatedResponse, param } from '../utils/helpers';
import { cacheService } from '../services/CacheService';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>);
    const cacheKey = `blog:list:${category || 'all'}:${page}:${pageSize}`;
    if (!search) {
      const cached = cacheService.get<{ posts: unknown[]; total: number }>(cacheKey);
      if (cached) return paginatedResponse(res, cached.posts, { page, pageSize, total: cached.total });
    }

    const where: Record<string, unknown> = {
      status: 'published',
      deletedAt: null,
      publishedAt: { lte: new Date() },
    };

    if (category) where.category = String(category);
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { content: { contains: String(search) } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          featuredImage: true,
          author: { select: { id: true, name: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    if (!search) cacheService.set(cacheKey, { posts, total }, 900);
    paginatedResponse(res, posts, { page, pageSize, total });
  })
);

router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '');
    if (!q) return successResponse(res, []);

    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
        ],
      },
      take: 20,
      include: { featuredImage: true, author: { select: { name: true } } },
    });

    successResponse(res, posts);
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const post = await prisma.blogPost.findFirst({
      where: {
        slug: param(req.params.slug),
        status: 'published',
        deletedAt: null,
        publishedAt: { lte: new Date() },
      },
      include: {
        featuredImage: true,
        author: { select: { id: true, name: true } },
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Blog post not found' },
      });
    }

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
      include: { featuredImage: true },
    });

    successResponse(res, { ...post, relatedPosts: related });
  })
);

export default router;
