import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';
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
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown[]>('branding:values:v2');
    if (cached) return successResponse(res, cached);

    const values = await prisma.coreValue.findMany({ orderBy: { order: 'asc' } });

    cacheService.set('branding:values:v2', values, 300);
    successResponse(res, values);
  })
);

router.get(
  '/advantages',
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown[]>('branding:advantages:v2');
    if (cached) return successResponse(res, cached);

    const advantages = await prisma.competitiveAdvantage.findMany({ orderBy: { order: 'asc' } });

    cacheService.set('branding:advantages:v2', advantages, 300);
    successResponse(res, advantages);
  })
);

router.get(
  '/team',
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown[]>('branding:team:v2');
    if (cached) return successResponse(res, cached);

    const team = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: { photo: true },
    });

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

    cacheService.set('branding:team:v2', mapped, 300);
    successResponse(res, mapped);
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
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown[]>('branding:stats:v2');
    if (cached) return successResponse(res, cached);

    const stats = await prisma.stat.findMany({ orderBy: { order: 'asc' } });

    cacheService.set('branding:stats:v2', stats as unknown[], 300);
    successResponse(res, stats as unknown[]);
  })
);

export default router;
