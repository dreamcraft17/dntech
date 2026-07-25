import { cache } from 'react';
import { asArray } from '@/lib/api';
import { fetchPublicApiSafe } from '@/lib/server-api';
import type { TeamMember, Testimonial } from '@/types';

export interface BrandContent {
  tagline?: string;
  story?: string;
  mission?: string;
}

export interface CoreValue {
  id: string;
  name: string;
  description: string;
  iconName?: string;
  order?: number;
}

export interface CompetitiveAdvantage {
  id: string;
  title: string;
  description?: string;
  iconName?: string;
  order?: number;
}

export interface BrandStat {
  icon?: string;
  value: string;
  label: string;
}

async function fetchBranding<T>(endpoint: string): Promise<T | null> {
  return fetchPublicApiSafe<T>(`/branding/${endpoint}`, 300);
}

export const getBrandContent = cache(async () => {
  const data = await fetchBranding<BrandContent>('content');
  return data ?? {};
});

export const getCoreValues = cache(async () => {
  const data = await fetchBranding<CoreValue[]>('values');
  return asArray(data);
});

export const getCompetitiveAdvantages = cache(async () => {
  const data = await fetchBranding<CompetitiveAdvantage[]>('advantages');
  return asArray(data);
});

export const getBrandStats = cache(async () => {
  const raw = asArray(await fetchBranding<BrandStat[]>('stats'));
  return raw.filter((item) => item.value && item.label);
});

export const getBrandTeam = cache(async () => {
  const data = await fetchBranding<TeamMember[]>('team');
  return asArray(data);
});

export const getBrandTestimonials = cache(async () => {
  const data = await fetchBranding<Testimonial[]>('testimonials');
  return asArray(data);
});
