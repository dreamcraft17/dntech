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

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseValues(raw: unknown): AboutContent['values'] {
  if (!Array.isArray(raw)) return undefined;
  const values = raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const rec = item as Record<string, unknown>;
    const title = asTrimmedString(rec.title);
    const description = asTrimmedString(rec.description);
    if (!title || !description) return [];
    return [{ title, description }];
  });
  return values.length > 0 ? values : undefined;
}

function parseAchievements(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const items = raw
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

/**
 * About page reads SiteSettings.aboutContent; honest copy is seeded into
 * BrandContent. Merge so /about is not empty after `db:seed-branding`.
 */
export function parseAboutContent(raw: unknown): AboutContent {
  if (!raw) return {};

  let obj: unknown = raw;
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj) as unknown;
    } catch {
      return {};
    }
  }

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};

  const rec = obj as Record<string, unknown>;
  const parsed: AboutContent = {};
  const story = asTrimmedString(rec.story);
  const mission = asTrimmedString(rec.mission);
  const vision = asTrimmedString(rec.vision);
  const values = parseValues(rec.values);
  const achievements = parseAchievements(rec.achievements);
  if (story) parsed.story = story;
  if (mission) parsed.mission = mission;
  if (vision) parsed.vision = vision;
  if (values) parsed.values = values;
  if (achievements) parsed.achievements = achievements;
  return parsed;
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

export function hasAboutCopy(about: AboutContent): boolean {
  return Boolean(
    about.story ||
      about.mission ||
      about.vision ||
      (about.values && about.values.length > 0) ||
      (about.achievements && about.achievements.length > 0),
  );
}
