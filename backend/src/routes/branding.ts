import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';
import { cacheService } from '../services/CacheService';

type AboutValue = {
  title?: string;
  description?: string;
  iconName?: string;
};

type AboutContent = {
  story?: string;
  mission?: string;
  values?: AboutValue[];
};

const router = Router();

router.get(
  '/content',
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown>('branding:content');
    if (cached) return successResponse(res, cached);

    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    const about = (settings?.aboutContent || {}) as AboutContent;
    const content = {
      tagline: settings?.tagline || 'Tentang DN Tech',
      story: about.story || '',
      mission: about.mission || '',
    };

    cacheService.set('branding:content', content, 300);
    successResponse(res, content);
  })
);

router.get(
  '/values',
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown[]>('branding:values');
    if (cached) return successResponse(res, cached);

    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    const about = (settings?.aboutContent || {}) as AboutContent;
    const values = Array.isArray(about.values)
      ? about.values
          .filter((value) => value?.title && value?.description)
          .map((value, index) => ({
            id: `${index}-${value.title}`,
            name: value.title,
            description: value.description,
            iconName: value.iconName || 'CheckCircle',
            order: index,
          }))
      : [];

    cacheService.set('branding:values', values, 300);
    successResponse(res, values);
  })
);

router.get(
  '/advantages',
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown[]>('branding:advantages');
    if (cached) return successResponse(res, cached);

    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    const badges = Array.isArray(settings?.trustBadges)
      ? settings?.trustBadges
      : [];

    const advantages = badges
      .filter((item: any) => item?.label)
      .map((item: any, index: number) => ({
        id: `${index}-${item.label}`,
        title: String(item.label),
        description: String(item.description || ''),
        iconName: String(item.icon || 'Shield'),
        order: index,
      }));

    cacheService.set('branding:advantages', advantages, 300);
    successResponse(res, advantages);
  })
);

router.get(
  '/team',
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown[]>('branding:team');
    if (cached) return successResponse(res, cached);

    const team = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: { photo: true },
    });

    cacheService.set('branding:team', team, 300);
    successResponse(res, team);
  })
);

router.get(
  '/testimonials',
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown[]>('branding:testimonials');
    if (cached) return successResponse(res, cached);

    const testimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      include: { photo: true },
      take: 6,
    });

    cacheService.set('branding:testimonials', testimonials, 300);
    successResponse(res, testimonials);
  })
);

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<unknown[]>('branding:stats');
    if (cached) return successResponse(res, cached);

    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    const stats = Array.isArray(settings?.homeStats)
      ? settings.homeStats
      : [];

    cacheService.set('branding:stats', stats as unknown[], 300);
    successResponse(res, stats as unknown[]);
  })
);

export default router;
