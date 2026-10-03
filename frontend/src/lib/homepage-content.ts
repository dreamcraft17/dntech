import type { PublicSettings } from '@/lib/settings';
import idHomeMessages from '@/messages/id/home.json';
import enHomeMessages from '@/messages/en/home.json';

export interface HomeStep {
  step: number;
  title: string;
  description: string;
}

export interface HomeAdvantage {
  title: string;
  description: string;
}

export interface HomeTechCategory {
  category: string;
  items: string[];
}

export interface HomePricingPlan {
  name: string;
  price: string;
  timeline?: string;
  included: string[];
}

export interface HomeServiceCard {
  name: string;
  description: string;
  slug?: string;
  category?: string;
}

export interface HomeCta {
  label: string;
  href: string;
}

export interface HomeFaqEntry {
  question: string;
  answer: string;
}

export interface HomeContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadges?: string[];
  heroSupporting?: string;
  heroPrimaryCta?: HomeCta;
  heroSecondaryCta?: HomeCta;
  productsTitle?: string;
  productsSubtitle?: string;
  processSteps?: HomeStep[];
  advantages?: HomeAdvantage[];
  techStack?: HomeTechCategory[];
  pricing?: HomePricingPlan[];
  defaultServices?: HomeServiceCard[];
  hiringRoles?: string[];
  hiringEmail?: string;
  portfolioMessage?: string;
  testimonialsMessage?: string;
}

/**
 * Shape of the `home.defaults` block in each locale's message catalog. The
 * hardcoded homepage copy lives there (not in this module) so it is translated
 * alongside the rest of the UI; CMS/backend settings still override it.
 */
export interface HomeDefaultsCatalog {
  heroTitle: string;
  heroSubtitle: string;
  heroBadges: string[];
  heroSupporting: string;
  heroPrimaryCta: HomeCta;
  heroSecondaryCta: HomeCta;
  productsTitle: string;
  productsSubtitle: string;
  services: HomeServiceCard[];
  processSteps: { title: string; description: string }[];
  advantages: HomeAdvantage[];
  techStack: HomeTechCategory[];
  pricing: { name: string; price: string; timeline: string; included: string[] }[];
  faq: HomeFaqEntry[];
  hiringRoles: string[];
  portfolioMessage: string;
  testimonialsMessage: string;
}

const DEFAULTS_BY_LOCALE: Record<string, HomeDefaultsCatalog> = {
  id: idHomeMessages.home.defaults,
  en: enHomeMessages.home.defaults,
};

const FALLBACK_LOCALE = 'id';

/** Default homepage copy for a locale, falling back to Indonesian. */
export function getHomeDefaults(locale?: string): HomeDefaultsCatalog {
  return DEFAULTS_BY_LOCALE[locale ?? FALLBACK_LOCALE] ?? DEFAULTS_BY_LOCALE[FALLBACK_LOCALE];
}

function toSteps(steps: HomeDefaultsCatalog['processSteps']): HomeStep[] {
  return steps.map((step, index) => ({ step: index + 1, ...step }));
}

function toPricing(plans: HomeDefaultsCatalog['pricing']): HomePricingPlan[] {
  return plans.map(({ timeline, ...plan }) => (timeline ? { ...plan, timeline } : plan));
}

const ID_DEFAULTS = getHomeDefaults(FALLBACK_LOCALE);

// Indonesian defaults kept as named exports for callers (and tests) that need
// them without a locale in hand. Prefer `getHomeDefaults(locale)`.
export const DEFAULT_HERO = {
  title: ID_DEFAULTS.heroTitle,
  badges: ID_DEFAULTS.heroBadges,
  supporting: ID_DEFAULTS.heroSupporting,
};
export const DEFAULT_HERO_PRIMARY_CTA: HomeCta = ID_DEFAULTS.heroPrimaryCta;
export const DEFAULT_HERO_SECONDARY_CTA: HomeCta = ID_DEFAULTS.heroSecondaryCta;
export const DEFAULT_PRODUCTS_SECTION = {
  title: ID_DEFAULTS.productsTitle,
  subtitle: ID_DEFAULTS.productsSubtitle,
};
export const DEFAULT_HOME_SERVICES: HomeServiceCard[] = ID_DEFAULTS.services;
export const DEFAULT_PROCESS_STEPS: HomeStep[] = toSteps(ID_DEFAULTS.processSteps);
export const DEFAULT_ADVANTAGES: HomeAdvantage[] = ID_DEFAULTS.advantages;
export const DEFAULT_TECH_STACK: HomeTechCategory[] = ID_DEFAULTS.techStack;
export const DEFAULT_PRICING: HomePricingPlan[] = toPricing(ID_DEFAULTS.pricing);
export const DEFAULT_FAQ: HomeFaqEntry[] = ID_DEFAULTS.faq;
export const DEFAULT_HIRING_ROLES: string[] = ID_DEFAULTS.hiringRoles;

function asHomeContent(raw: unknown): HomeContent {
  if (!raw || typeof raw !== 'object') return {};
  return raw as HomeContent;
}

function asCta(raw: unknown, fallback: HomeCta): HomeCta {
  if (!raw || typeof raw !== 'object') return fallback;
  const candidate = raw as Record<string, unknown>;
  const label =
    typeof candidate.label === 'string' && candidate.label.trim()
      ? candidate.label.trim()
      : fallback.label;
  const href =
    typeof candidate.href === 'string' && candidate.href.trim()
      ? candidate.href.trim()
      : fallback.href;
  return { label, href };
}

export interface ResolvedHomeContent {
  heroTitle: string;
  heroSubtitle: string;
  heroBadges: string[];
  heroSupporting: string;
  heroPrimaryCta: HomeCta;
  heroSecondaryCta: HomeCta;
  productsTitle: string;
  productsSubtitle: string;
  processSteps: HomeStep[];
  advantages: HomeAdvantage[];
  techStack: HomeTechCategory[];
  pricing: HomePricingPlan[];
  defaultServices: HomeServiceCard[];
  defaultFaq: HomeFaqEntry[];
  hiringRoles: string[];
  hiringEmail: string;
  portfolioMessage: string;
  testimonialsMessage: string;
}

/**
 * Merge backend-managed homepage copy with the active locale's defaults.
 * Values the admin typed in the CMS win and are used verbatim — they are never
 * machine-translated here.
 */
export function resolveHomeContent(
  settings: PublicSettings,
  locale?: string
): ResolvedHomeContent {
  const cms = asHomeContent(settings.homeContent);
  const defaults = getHomeDefaults(locale);

  return {
    heroTitle: cms.heroTitle || settings.tagline || defaults.heroTitle,
    heroSubtitle: cms.heroSubtitle || defaults.heroSubtitle,
    heroBadges: cms.heroBadges?.length ? cms.heroBadges : defaults.heroBadges,
    heroSupporting: cms.heroSupporting || settings.heroDescription || defaults.heroSupporting,
    heroPrimaryCta: asCta(cms.heroPrimaryCta, defaults.heroPrimaryCta),
    heroSecondaryCta: asCta(cms.heroSecondaryCta, defaults.heroSecondaryCta),
    productsTitle: cms.productsTitle || defaults.productsTitle,
    productsSubtitle: cms.productsSubtitle || defaults.productsSubtitle,
    processSteps: cms.processSteps?.length ? cms.processSteps : toSteps(defaults.processSteps),
    advantages: cms.advantages?.length ? cms.advantages : defaults.advantages,
    techStack: cms.techStack?.length ? cms.techStack : defaults.techStack,
    pricing: cms.pricing?.length ? cms.pricing : toPricing(defaults.pricing),
    defaultServices: cms.defaultServices?.length ? cms.defaultServices : defaults.services,
    defaultFaq: defaults.faq,
    hiringRoles: cms.hiringRoles?.length ? cms.hiringRoles : defaults.hiringRoles,
    hiringEmail: cms.hiringEmail || settings.companyEmail || 'careers@dntech.id',
    portfolioMessage: cms.portfolioMessage || defaults.portfolioMessage,
    testimonialsMessage: cms.testimonialsMessage || defaults.testimonialsMessage,
  };
}
