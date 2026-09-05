import { z } from 'zod';
import prisma from '../config/database';
import { logActivity } from '../middleware/auth';
import { cacheService } from '../services/CacheService';

/**
 * Site-wide settings admin logic, extracted from backend/src/routes/admin.ts.
 * Behavior preserved 1:1 (single-row upsert on id=1).
 */

const settingsSchema = z.object({
  companyName: z.string().optional(),
  tagline: z.string().optional(),
  companyEmail: z.string().optional(),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  primaryColor: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
  seoTitleTemplate: z.string().optional(),
  seoDescriptionTemplate: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  termsContent: z.string().optional(),
  privacyContent: z.string().optional(),
  aboutContent: z.record(z.string(), z.unknown()).optional(),
  trustBadges: z.array(z.object({ icon: z.string().optional(), label: z.string(), description: z.string().optional() })).optional(),
  clientLogos: z.array(z.object({ name: z.string(), initial: z.string().optional() })).optional(),
  homeStats: z.array(z.object({ icon: z.string().optional(), value: z.string(), label: z.string() })).optional(),
  homeContent: z.record(z.string(), z.unknown()).optional(),
  resources: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    type: z.string().optional(),
    downloadUrl: z.string().optional(),
  })).optional(),
  heroDescription: z.string().optional(),
  businessHours: z.string().optional(),
  calendlyUrl: z.string().optional(),
  leadMagnetUrl: z.string().optional(),
  crispWebsiteId: z.string().optional(),
  isMaintenanceMode: z.boolean().optional(),
});

export async function getSettings() {
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
  return settings;
}

export async function updateSettings(body: unknown, userId: string, ip?: string) {
  const parsed = settingsSchema.parse(body);

  const data = {
    ...parsed,
    aboutContent: parsed.aboutContent as object | undefined,
    homeContent: parsed.homeContent as object | undefined,
    socialLinks: parsed.socialLinks as object | undefined,
  };

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
    include: { logo: true, favicon: true },
  });
  await logActivity(userId, 'update', 'settings', '1', data, ip);
  cacheService.clear();
  return settings;
}
