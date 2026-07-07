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
  viewCount?: number;
  featuredImage?: { url: string };
  author?: { name: string };
  relatedPosts?: BlogPost[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  bio?: string;
  photo?: { url: string };
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
  type?: string;
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
