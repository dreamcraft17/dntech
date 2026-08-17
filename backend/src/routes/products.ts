import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse, param } from '../utils/helpers';
import { cacheService } from '../services/CacheService';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, search, homepage } = req.query;
    const homepageOnly = homepage === 'true' || homepage === '1';
    const cacheKey = `products:list:${category || 'all'}:homepage:${homepageOnly ? '1' : '0'}`;
    if (!search) {
      const cached = cacheService.get<unknown[]>(cacheKey);
      if (cached) return successResponse(res, cached);
    }

    const where: Record<string, unknown> = { status: 'active', deletedAt: null };

    if (homepageOnly) where.showOnHomepage = true;
    if (category) where.category = String(category);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const products = await prisma.product.findMany({
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
        tagline: true,
        heroImage: true,
        logoUrl: true,
        featured: true,
        showOnHomepage: true,
        launchStatus: true,
        customerCount: true,
        pricingTiers: true,
      },
    });

    if (!search) cacheService.set(cacheKey, products, 3600);
    successResponse(res, products);
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findFirst({
      where: { slug: param(req.params.slug), status: 'active', deletedAt: null },
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
