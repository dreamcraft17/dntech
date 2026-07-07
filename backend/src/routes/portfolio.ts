import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse, getPagination, paginatedResponse, param } from '../utils/helpers';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { industry, technology, search } = req.query;
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>);

    const where: Record<string, unknown> = { status: 'active', deletedAt: null };

    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { clientName: { contains: String(search) } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.portfolioItem.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        skip,
        take: pageSize,
        include: { featuredImage: true },
      }),
      prisma.portfolioItem.count({ where }),
    ]);

    let filtered = items;
    if (industry) {
      filtered = items.filter((item) => {
        const industries = (item.industries as string[]) || [];
        return industries.includes(String(industry));
      });
    }

    paginatedResponse(res, filtered, { page, pageSize, total });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const item = await prisma.portfolioItem.findFirst({
      where: { slug: param(req.params.slug), status: 'active', deletedAt: null },
      include: { featuredImage: true },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Portfolio item not found' },
      });
    }

    successResponse(res, item);
  })
);

export default router;
