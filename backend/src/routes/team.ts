import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const members = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: { photo: true },
    });
    successResponse(res, members);
  })
);

export default router;
