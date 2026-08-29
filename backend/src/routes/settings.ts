import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler, successResponse } from '../utils/helpers';
import { cacheService } from '../services/CacheService';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const cached = cacheService.get<Record<string, unknown>>('settings:public');
    if (cached) return successResponse(res, cached);

    let settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
      include: { logo: true, favicon: true },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: 1 },
        include: { logo: true, favicon: true },
      });
    }

    const publicSettings = {
      companyName: settings.companyName,
      tagline: settings.tagline,
      companyEmail: settings.companyEmail,
      companyPhone: settings.companyPhone,
      companyAddress: settings.companyAddress,
      primaryColor: settings.primaryColor,
      socialLinks: settings.socialLinks,
      logo: settings.logo,
      favicon: settings.favicon,
      googleAnalyticsId: settings.googleAnalyticsId,
      aboutContent: settings.aboutContent,
      trustBadges: settings.trustBadges,
      clientLogos: settings.clientLogos,
      homeStats: settings.homeStats,
      homeContent: settings.homeContent,
      resources: settings.resources,
      heroDescription: settings.heroDescription,
      businessHours: settings.businessHours,
      calendlyUrl: settings.calendlyUrl,
      leadMagnetUrl: settings.leadMagnetUrl,
      crispWebsiteId: settings.crispWebsiteId,
      isMaintenanceMode: settings.isMaintenanceMode,
      seoTitleTemplate: settings.seoTitleTemplate,
      seoDescriptionTemplate: settings.seoDescriptionTemplate,
    };

    cacheService.set('settings:public', publicSettings, 300);
    successResponse(res, publicSettings);
  })
);

router.get(
  '/legal/terms',
  asyncHandler(async (_req, res) => {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    successResponse(res, { content: settings?.termsContent || '' });
  })
);

router.get(
  '/legal/privacy',
  asyncHandler(async (_req, res) => {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    successResponse(res, { content: settings?.privacyContent || '' });
  })
);

export default router;
