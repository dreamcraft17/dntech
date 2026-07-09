import { cache } from 'react';
import { asArray } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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
  try {
    const res = await fetch(`${API_URL}/settings`, { next: { revalidate: 300 } });
    if (!res.ok) return {};
    const json = await res.json();
    return (json.data ?? {}) as PublicSettings;
  } catch {
    return {};
  }
});

export function getHomeStats(settings: PublicSettings) {
  return asArray(settings.homeStats).filter((s) => s.value && s.label);
}

export function getResources(settings: PublicSettings) {
  return asArray(settings.resources).filter((r) => r.title);
}
