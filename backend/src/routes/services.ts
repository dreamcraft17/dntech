import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse, getPagination, paginatedResponse, param } from '../utils/helpers';
import { cacheService } from '../services/CacheService';
import { normalizeLocale, resolveServiceRecord, type SiteLocale } from '../utils/service-locale';

const router = Router();

const TRANSLATION_SELECT = {
  select: {
    locale: true,
    name: true,
    slug: true,
    description: true,
    features: true,
    category: true,
    seoTitle: true,
    seoDescription: true,
    isMachine: true,
  },
} as const;

function requestLocale(req: { query: Record<string, unknown>; headers: Record<string, unknown> }): SiteLocale {
  return normalizeLocale(req.query.locale, (req.headers['accept-language'] as string) ?? null);
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    const locale = requestLocale(req);
    const { page, pageSize, skip } = getPagination(req.query as Record<string, unknown>, 100);
    const cacheKey = `services:list:${locale}:${category || 'all'}:${page}:${pageSize}`;
    if (!search) {
      const cached = cacheService.get<{ services: unknown[]; total: number }>(cacheKey);
      if (cached) return paginatedResponse(res, cached.services, { page, pageSize, total: cached.total });
    }

    const where: Record<string, unknown> = { status: 'active', deletedAt: null };
    const filters: Record<string, unknown>[] = [];

    if (category) {
      filters.push({
        OR: [{ category: String(category) }, { translations: { some: { locale, category: String(category) } } }],
      });
    }
    if (search) {
      const textMatch = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
      filters.push({ OR: [...textMatch, { translations: { some: { locale, OR: textMatch } } }] });
    }
    if (filters.length) where.AND = filters;

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          features: true,
          iconUrl: true,
          category: true,
          displayOrder: true,
          seoTitle: true,
          seoDescription: true,
          locale: true,
          translations: { where: { locale }, ...TRANSLATION_SELECT },
        },
      }),
      prisma.service.count({ where }),
    ]);

    const resolved = services.map((service) => resolveServiceRecord(service, locale));
    if (!search) cacheService.set(cacheKey, { services: resolved, total }, 3600);
    paginatedResponse(res, resolved, { page, pageSize, total });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const locale = requestLocale(req);
    const slug = param(req.params.slug);

    const service = await prisma.service.findFirst({
      where: {
        status: 'active',
        deletedAt: null,
        OR: [{ slug }, { translations: { some: { slug } } }],
      },
      include: { translations: { where: { locale }, ...TRANSLATION_SELECT } },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Service not found' },
      });
    }

    const resolved = resolveServiceRecord(service, locale);

    const related = await prisma.service.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        category: service.category,
        id: { not: service.id },
      },
      take: 3,
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconUrl: true,
        category: true,
        locale: true,
        translations: { where: { locale }, ...TRANSLATION_SELECT },
      },
    });

    successResponse(res, {
      ...resolved,
      relatedServices: related.map((item) => resolveServiceRecord(item, locale)),
    });
  })
);

export default router;
