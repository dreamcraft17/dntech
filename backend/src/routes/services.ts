import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse, getPagination, paginatedResponse, param } from '../utils/helpers';
import { cacheService } from '../services/CacheService';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>, 100);
    const cacheKey = `services:list:${category || 'all'}:${page}:${pageSize}`;
    if (!search) {
      const cached = cacheService.get<{ services: unknown[]; total: number }>(cacheKey);
      if (cached) return paginatedResponse(res, cached.services, { page, pageSize, total: cached.total });
    }

    const where: Record<string, unknown> = { status: 'active', deletedAt: null };

    if (category) where.category = String(category);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          features: true,
          iconUrl: true,
          category: true,
          displayOrder: true,
          seoTitle: true,
          seoDescription: true,
        },
      }),
      prisma.service.count({ where }),
    ]);

    if (!search) cacheService.set(cacheKey, { services, total }, 3600);
    paginatedResponse(res, services, { page, pageSize, total });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const service = await prisma.service.findFirst({
      where: { slug: param(req.params.slug), status: 'active', deletedAt: null },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found' },
      });
    }

    const related = await prisma.service.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        category: service.category,
        id: { not: service.id },
      },
      take: 3,
      orderBy: { displayOrder: 'asc' },
    });

    successResponse(res, { ...service, relatedServices: related });
  })
);

export default router;
