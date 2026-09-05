import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, getPagination, paginatedResponse } from '../utils/helpers';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>, 100);
    const where = { status: 'active' as const };

    const [careers, total] = await Promise.all([
      prisma.career.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.career.count({ where }),
    ]);

    paginatedResponse(res, careers, { page, pageSize, total });
  })
);

export default router;
