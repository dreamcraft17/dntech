import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const careers = await prisma.career.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    successResponse(res, careers);
  })
);

export default router;
