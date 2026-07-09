import { AboutPageContent } from '@/components/content/AboutPageContent';
import { buildMetadata, PAGE_SEO } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: PAGE_SEO.about.title,
  description: PAGE_SEO.about.description,
  path: '/about',
  keywords: PAGE_SEO.about.keywords,
});

export default function AboutPage() {
  return <AboutPageContent />;
}
