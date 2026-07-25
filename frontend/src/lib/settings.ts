import { cache } from 'react';
import { asArray } from '@/lib/api';
import { fetchPublicApiSafe } from '@/lib/server-api';

export interface PublicSettings {
  companyName?: string;
  tagline?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  heroDescription?: string;
  businessHours?: string;
  aboutContent?: Record<string, unknown>;
  trustBadges?: { icon?: string; label: string; description?: string }[];
  clientLogos?: { name: string; initial?: string }[];
  homeStats?: { icon?: string; value: string; label: string }[];
  homeContent?: Record<string, unknown>;
  resources?: { title: string; description?: string; type?: string; downloadUrl?: string }[];
  calendlyUrl?: string;
  leadMagnetUrl?: string;
  crispWebsiteId?: string;
  googleAnalyticsId?: string;
  socialLinks?: Record<string, string>;
  primaryColor?: string;
}

export const getPublicSettings = cache(async function getPublicSettings(): Promise<PublicSettings> {
  const data = await fetchPublicApiSafe<PublicSettings>('/settings', 300);
  return data ?? {};
});

export function getHomeStats(settings: PublicSettings) {
  return asArray(settings.homeStats).filter((s) => s.value && s.label);
}

export function getResources(settings: PublicSettings) {
  return asArray(settings.resources).filter((r) => r.title);
}
