import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse, param } from '../utils/helpers';
import { cacheService } from '../services/CacheService';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    const cacheKey = `services:list:${category || 'all'}`;
    if (!search) {
      const cached = cacheService.get<unknown[]>(cacheKey);
      if (cached) return successResponse(res, cached);
    }

    const where: Record<string, unknown> = { status: 'active', deletedAt: null };

    if (category) where.category = String(category);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
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
    });

    if (!search) cacheService.set(cacheKey, services, 3600);
    successResponse(res, services);
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
