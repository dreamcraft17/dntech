import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { asyncHandler, successResponse, paginatedResponse, getPagination, param } from '../utils/helpers';

const router = Router();

function mapCaseStudy(item: Record<string, unknown>) {
  const featuredImage = item.featuredImage as { url?: string; altText?: string } | null | undefined;
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    challenge: item.challenge,
    solution: item.solution,
    results: item.outcomes,
    metrics: item.metrics,
    clientName: item.clientName,
    clientLogo: item.clientLogoUrl,
    clientQuote: item.testimonial,
    industries: item.industries,
    heroImage: featuredImage?.url,
    heroImageAlt: featuredImage?.altText,
    featuredImage,
    publishedAt: item.createdAt,
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>);
    const where = { status: 'active' as const, deletedAt: null };

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

    paginatedResponse(res, items.map(mapCaseStudy), { page, pageSize, total });
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
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case study not found' } });
    }

    successResponse(res, mapCaseStudy(item as unknown as Record<string, unknown>));
  })
);

export default router;
