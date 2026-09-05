import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, getPagination, paginatedResponse } from '../utils/helpers';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>, 100);
    const where = { isApproved: true };

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: { photo: true },
      }),
      prisma.testimonial.count({ where }),
    ]);

    paginatedResponse(res, testimonials, { page, pageSize, total });
  })
);

export default router;
