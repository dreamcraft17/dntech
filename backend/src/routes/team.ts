import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';
import { cacheService } from '../services/CacheService';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown[]>('team:active');
    if (cached) return successResponse(res, cached);

    const members = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: { photo: true },
    });

    cacheService.set('team:active', members, 1800);
    successResponse(res, members);
  })
);

export default router;
