import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { buildMetadata, getPageSeo } from '@/lib/seo';
import { FaqJsonLd } from './FaqJsonLd';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPageSeo('faq', locale);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: '/faq',
    keywords: seo.keywords,
    locale,
  });
}

export default async function FaqLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <FaqJsonLd locale={locale} />
      {children}
    </>
  );
}
