export interface AboutContent {
  story?: string;
  mission?: string;
  vision?: string;
  values?: { title: string; description: string }[];
  achievements?: string[];
}

export interface BrandAboutSource {
  story?: string;
  mission?: string;
  tagline?: string;
}

export interface CoreValueSource {
  name: string;
  description: string;
}

/**
 * About page reads SiteSettings.aboutContent; honest copy is seeded into
 * BrandContent. Merge so /about is not empty after `db:seed-branding`.
 */
export function parseAboutContent(raw: unknown): AboutContent {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as AboutContent;
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') return raw as AboutContent;
  return {};
}

export function resolveAboutContent(
  fromSettings: AboutContent,
  brand: BrandAboutSource,
  coreValues: CoreValueSource[] = [],
): AboutContent {
  const values =
    fromSettings.values && fromSettings.values.length > 0
      ? fromSettings.values
      : coreValues.map((value) => ({ title: value.name, description: value.description }));

  return {
    story: fromSettings.story || brand.story,
    mission: fromSettings.mission || brand.mission,
    vision: fromSettings.vision,
    values: values.length > 0 ? values : undefined,
    achievements: fromSettings.achievements,
  };
}
