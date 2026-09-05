import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, getPagination, paginatedResponse } from '../utils/helpers';
import { cacheService } from '../services/CacheService';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>, 100);
    const cacheKey = `team:active:${page}:${pageSize}`;
    const cached = cacheService.get<{ members: unknown[]; total: number }>(cacheKey);
    if (cached) return paginatedResponse(res, cached.members, { page, pageSize, total: cached.total });

    const where = { isActive: true };
    const [members, total] = await Promise.all([
      prisma.teamMember.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        skip,
        take: pageSize,
        include: { photo: true },
      }),
      prisma.teamMember.count({ where }),
    ]);

    cacheService.set(cacheKey, { members, total }, 1800);
    paginatedResponse(res, members, { page, pageSize, total });
  })
);

export default router;
