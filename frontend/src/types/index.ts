export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  features?: { title: string; description?: string }[];
  iconUrl?: string;
  category?: string;
  status?: string;
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  relatedServices?: Service[];
}

export interface ProductCta {
  label: string;
  url: string;
  type?: string;
  color?: string;
  size?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  icon?: string;
  tagline?: string;
  popular?: boolean;
  featured?: boolean;
  pricing: {
    amount: number | null;
    currency: string;
    billingPeriod: string;
    description?: string;
  };
  features: string[];
  cta: ProductCta;
  saveLabel?: string | null;
}

export interface ProductFeatureItem {
  title?: string;
  name?: string;
  description?: string;
}

export interface ProductFeatureGroup {
  category: string;
  icon?: string;
  features: ProductFeatureItem[];
}

export interface ProductIntegration {
  name: string;
  logo?: string;
  category?: string;
  description?: string;
  status?: string;
  url?: string;
}

export interface UseCaseSegment {
  id: string;
  segment: string;
  icon?: string;
  description?: string;
  uniqueFeatures?: string[];
  testimonial?: { quote: string; author: string; company?: string; location?: string };
  stats?: Record<string, string>;
  cta?: ProductCta;
}

export interface ProductTestimonial {
  id: string;
  quote: string;
  author: string;
  company?: string;
  employeeCount?: string;
  location?: string;
  industry?: string;
  avatar?: string;
  rating?: number;
  videoUrl?: string | null;
  segment?: string;
}

export interface ComparisonTable {
  title?: string;
  competitors: string[];
  rows: Array<Record<string, string> & { feature: string; category?: string }>;
}

export interface RoadmapQuarter {
  quarter: string;
  status: string;
  features: { name: string; description?: string }[];
}

export interface ProductFaqItem {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  features?: ProductFeatureItem[] | ProductFeatureGroup[];
  iconUrl?: string;
  category?: string;
  status?: string;
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  relatedProducts?: Product[];

  tagline?: string;
  heroImage?: string;
  heroAlt?: string;
  logoUrl?: string;
  screenshotUrls?: string[];
  keywords?: string;
  canonical?: string;
  featured?: boolean;
  showOnHomepage?: boolean;
  publishedAt?: string;
  launchStatus?: string;
  freemiumEnabled?: boolean;
  freeLimit?: string;
  trialDays?: number;
  customerCount?: string;
  techStack?: string[];
  pricingTiers?: PricingTier[];
  integrations?: ProductIntegration[];
  useCases?: UseCaseSegment[];
  testimonials?: ProductTestimonial[];
  caseStudies?: unknown[];
  comparisonTable?: ComparisonTable;
  roadmap?: RoadmapQuarter[];
  primaryCta?: ProductCta;
  secondaryCtas?: ProductCta[];
  pricingCalcUrl?: string;
  demoUrl?: string;
  longFormContent?: string;
  faq?: ProductFaqItem[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  clientName?: string;
  industries?: string[];
  outcomes?: string;
  challenge?: string;
  solution?: string;
  metrics?: Record<string, string>;
  testimonial?: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: { url: string; altText?: string };
  status?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  viewCount?: number;
  featuredImage?: { url: string; altText?: string };
  author?: { name: string };
  relatedPosts?: BlogPost[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  bio?: string;
  photo?: { url: string; altText?: string };
  socialLinks?: Record<string, string>;
}

export interface Testimonial {
  id: string;
  clientName: string;
  company?: string;
  position?: string;
  title?: string;
  quote: string;
  rating?: number;
  videoUrl?: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Career {
  id: string;
  title: string;
  slug: string;
  department?: string;
  location?: string;
  level?: string;
  type?: string;
  benefits?: string;
  description: string;
  requirements?: string;
}

export interface SiteSettings {
  companyName?: string;
  tagline?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  primaryColor?: string;
  socialLinks?: Record<string, string>;
  trustBadges?: { icon?: string; label: string; description?: string }[];
  clientLogos?: { name: string; initial?: string }[];
  calendlyUrl?: string;
  leadMagnetUrl?: string;
  aboutContent?: {
    story?: string;
    mission?: string;
    vision?: string;
    values?: { title: string; description: string }[];
    achievements?: string[];
  };
}

export interface Lead {
  id: string;
  formType: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: string;
  isRead: boolean;
  createdAt: string;
  assignedTo?: { id: string; name: string };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface SearchResult {
  type: string;
  title: string;
  snippet: string;
  url: string;
}
