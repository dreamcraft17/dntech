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
  bio: `Dozer Napitupulu mendirikan DN Tech agar klien dapat bekerja langsung dengan penulis kodenya, bukan melalui perantara account manager. Beliau mengembangkan aplikasi dan situs web sejak 2017, meliputi HRIS, ERP, dan perangkat lunak operasional. Pada proyek yang bersifat menentukan, beliau tetap terlibat dalam arsitektur, peninjauan kode, dan keputusan yang tidak dapat didelegasikan.

PT. Dozer Napitupulu Technology merupakan badan hukum yang menaungi studio ini. Produk first-party kami adalah bukti kerja teknis: yang telah tayang ditandai secara jelas; yang masih dalam tahap beta tidak disajikan sebagai studi kasus.`,
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
