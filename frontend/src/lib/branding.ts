import { cache } from 'react';
import { asArray } from '@/lib/api';
import type { TeamMember, Testimonial } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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

async function fetchBranding<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_URL}/branding/${endpoint}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to fetch branding/${endpoint}`);
  const json = await res.json();
  return json.data as T;
}

export const getBrandContent = cache(async () => {
  try {
    return await fetchBranding<BrandContent>('content');
  } catch {
    return {};
  }
});

export const getCoreValues = cache(async () => {
  try {
    return asArray(await fetchBranding<CoreValue[]>('values'));
  } catch {
    return [] as CoreValue[];
  }
});

export const getCompetitiveAdvantages = cache(async () => {
  try {
    return asArray(await fetchBranding<CompetitiveAdvantage[]>('advantages'));
  } catch {
    return [] as CompetitiveAdvantage[];
  }
});

export const getBrandStats = cache(async () => {
  try {
    const raw = asArray(await fetchBranding<BrandStat[]>('stats'));
    return raw.filter((item) => item.value && item.label);
  } catch {
    return [] as BrandStat[];
  }
});

export const getBrandTeam = cache(async () => {
  try {
    return asArray(await fetchBranding<TeamMember[]>('team'));
  } catch {
    return [] as TeamMember[];
  }
});

export const getBrandTestimonials = cache(async () => {
  try {
    return asArray(await fetchBranding<Testimonial[]>('testimonials'));
  } catch {
    return [] as Testimonial[];
  }
});
