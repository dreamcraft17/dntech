import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    const where: Record<string, unknown> = { isActive: true };

    if (category) where.category = String(category);
    if (search) {
      where.OR = [
        { question: { contains: String(search) } },
        { answer: { contains: String(search) } },
      ];
    }

    const faqs = await prisma.faq.findMany({
      where,
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });

    successResponse(res, faqs);
  })
);

export default router;
