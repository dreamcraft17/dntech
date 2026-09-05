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
    const cacheKey = `products:list:${category || 'all'}:public:${page}:${pageSize}`;
    if (!search) {
      const cached = cacheService.get<{ products: unknown[]; total: number }>(cacheKey);
      if (cached) return paginatedResponse(res, cached.products, { page, pageSize, total: cached.total });
    }

    const where: Record<string, unknown> = {
      status: 'active',
      deletedAt: null,
      showOnHomepage: true,
    };

    if (category) where.category = String(category);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
          tagline: true,
          heroImage: true,
          logoUrl: true,
          featured: true,
          showOnHomepage: true,
          launchStatus: true,
          customerCount: true,
          pricingTiers: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    if (!search) cacheService.set(cacheKey, { products, total }, 3600);
    paginatedResponse(res, products, { page, pageSize, total });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findFirst({
      where: {
        slug: param(req.params.slug),
        status: 'active',
        deletedAt: null,
        showOnHomepage: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    const related = await prisma.product.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        showOnHomepage: true,
        category: product.category,
        id: { not: product.id },
      },
      take: 3,
      orderBy: { displayOrder: 'asc' },
    });

    successResponse(res, { ...product, relatedProducts: related });
  })
);

export default router;
