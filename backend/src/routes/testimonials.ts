import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const testimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      include: { photo: true },
    });
    successResponse(res, testimonials);
  })
);

export default router;
