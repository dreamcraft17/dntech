import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse, getPagination, paginatedResponse } from '../utils/helpers';
import { cacheService } from '../services/CacheService';

const router = Router();

router.get(
  '/content',
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown>('branding:content:v2');
    if (cached) return successResponse(res, cached);

    const content = await prisma.brandContent.findFirst({ orderBy: { updatedAt: 'desc' } });

    cacheService.set('branding:content:v2', content, 300);
    successResponse(res, content);
  })
);

router.get(
  '/values',
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>, 100);
    const cacheKey = `branding:values:v2:${page}:${pageSize}`;
    const cached = cacheService.get<{ values: unknown[]; total: number }>(cacheKey);
    if (cached) return paginatedResponse(res, cached.values, { page, pageSize, total: cached.total });

    const [values, total] = await Promise.all([
      prisma.coreValue.findMany({ orderBy: { order: 'asc' }, skip, take: pageSize }),
      prisma.coreValue.count(),
    ]);

    cacheService.set(cacheKey, { values, total }, 300);
    paginatedResponse(res, values, { page, pageSize, total });
  })
);

router.get(
  '/advantages',
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>, 100);
    const cacheKey = `branding:advantages:v2:${page}:${pageSize}`;
    const cached = cacheService.get<{ advantages: unknown[]; total: number }>(cacheKey);
    if (cached) return paginatedResponse(res, cached.advantages, { page, pageSize, total: cached.total });

    const [advantages, total] = await Promise.all([
      prisma.competitiveAdvantage.findMany({ orderBy: { order: 'asc' }, skip, take: pageSize }),
      prisma.competitiveAdvantage.count(),
    ]);

    cacheService.set(cacheKey, { advantages, total }, 300);
    paginatedResponse(res, advantages, { page, pageSize, total });
  })
);

router.get(
  '/team',
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>, 100);
    const cacheKey = `branding:team:v2:${page}:${pageSize}`;
    const cached = cacheService.get<{ team: unknown[]; total: number }>(cacheKey);
    if (cached) return paginatedResponse(res, cached.team, { page, pageSize, total: cached.total });

    const teamWhere = { isActive: true };
    const [team, total] = await Promise.all([
      prisma.teamMember.findMany({
        where: teamWhere,
        orderBy: { displayOrder: 'asc' },
        skip,
        take: pageSize,
        include: { photo: true },
      }),
      prisma.teamMember.count({ where: teamWhere }),
    ]);

    const mapped = team.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      bio: member.bio || '',
      photoUrl: member.photo?.url || null,
      linkedinUrl: typeof member.socialLinks === 'object' && member.socialLinks && 'linkedin' in member.socialLinks
        ? String((member.socialLinks as Record<string, unknown>).linkedin || '')
        : null,
      twitterUrl: typeof member.socialLinks === 'object' && member.socialLinks && 'twitter' in member.socialLinks
        ? String((member.socialLinks as Record<string, unknown>).twitter || '')
        : null,
      order: member.displayOrder,
      published: member.isActive,
    }));

    cacheService.set(cacheKey, { team: mapped, total }, 300);
    paginatedResponse(res, mapped, { page, pageSize, total });
  })
);

router.get(
  '/testimonials',
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown[]>('branding:testimonials:v2');
    if (cached) return successResponse(res, cached);

    const testimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'asc' },
      include: { photo: true },
      take: 6,
    });

    const mapped = testimonials.map((item, index) => ({
      id: item.id,
      quote: item.quote,
      author: item.clientName,
      title: item.title || item.position || '',
      company: item.company,
      logoUrl: item.photo?.url || null,
      order: index,
      published: item.isApproved,
    }));

    cacheService.set('branding:testimonials:v2', mapped, 300);
    successResponse(res, mapped);
  })
);

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>, 100);
    const cacheKey = `branding:stats:v2:${page}:${pageSize}`;
    const cached = cacheService.get<{ stats: unknown[]; total: number }>(cacheKey);
    if (cached) return paginatedResponse(res, cached.stats, { page, pageSize, total: cached.total });

    const [stats, total] = await Promise.all([
      prisma.stat.findMany({ orderBy: { order: 'asc' }, skip, take: pageSize }),
      prisma.stat.count(),
    ]);

    cacheService.set(cacheKey, { stats: stats as unknown[], total }, 300);
    paginatedResponse(res, stats as unknown[], { page, pageSize, total });
  })
);

export default router;
