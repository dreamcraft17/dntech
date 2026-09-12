export interface AboutFounder {
  name: string;
  role?: string;
  bio?: string;
}

export interface AboutContent {
  story?: string;
  mission?: string;
  vision?: string;
  founder?: AboutFounder;
  values?: { title: string; description: string }[];
  achievements?: string[];
}

export const DEFAULT_FOUNDER: AboutFounder = {
  name: 'Dozer Napitupulu',
  role: 'Founder & Tech Lead',
  bio: `Dozer mendirikan DN Tech supaya klien kerja langsung dengan orang yang nulis kodenya — bukan lewat lapisan account manager. Lima belas tahun lebih develop software: HRIS, ERP, tools operasional. Di project penting dia masih masuk ke arsitektur, review, dan keputusan yang tidak bisa dilimpahkan.

PT. Dozer Napitupulu Technology adalah badan hukum di belakang studio ini. Produk first-party kami jadi bukti teknis — yang sudah live ditandai jelas, yang masih beta tidak dikamuflase jadi case study.`,
};

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

function parseFounder(raw: unknown): AboutFounder | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const rec = raw as Record<string, unknown>;
  const name = asTrimmedString(rec.name);
  if (!name) return undefined;
  const role = asTrimmedString(rec.role);
  const bio = asTrimmedString(rec.bio);
  return { name, ...(role ? { role } : {}), ...(bio ? { bio } : {}) };
}

export function resolveFounder(fromSettings?: AboutFounder): AboutFounder {
  if (!fromSettings) return DEFAULT_FOUNDER;
  return {
    name: fromSettings.name,
    role: fromSettings.role || DEFAULT_FOUNDER.role,
    bio: fromSettings.bio || DEFAULT_FOUNDER.bio,
  };
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
  const founder = parseFounder(rec.founder);
  const values = parseValues(rec.values);
  const achievements = parseAchievements(rec.achievements);
  if (story) parsed.story = story;
  if (mission) parsed.mission = mission;
  if (vision) parsed.vision = vision;
  if (founder) parsed.founder = founder;
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
    founder: resolveFounder(fromSettings.founder),
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
