import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import '../../globals.css';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_KEYWORDS,
  DEFAULT_TITLE_TEMPLATE,
  DEFAULT_SITE_DESCRIPTION,
  localeAlternates,
  localePath,
  OG_LOCALES,
} from '@/lib/seo';
import { getPublicSettings } from '@/lib/settings';
import { GlobalLoadingIndicator } from '@/components/ui/GlobalLoadingIndicator';
import { AnalyticsLoader } from '@/components/seo/AnalyticsLoader';
import { routing } from '@/i18n/routing';

const DEFAULT_GOOGLE_ANALYTICS_ID = 'G-V6262D1WEE';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [settings, t] = await Promise.all([
    getPublicSettings(),
    getTranslations({ locale, namespace: 'site' }),
  ]);

  const rawTemplate = settings.seoTitleTemplate?.trim() || DEFAULT_TITLE_TEMPLATE;
  const titleTemplate = rawTemplate.includes('%s') ? rawTemplate : DEFAULT_TITLE_TEMPLATE;
  const description = settings.seoDescriptionTemplate?.trim() || DEFAULT_SITE_DESCRIPTION;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_NAME} - ${t('tagline')}`,
      template: titleTemplate,
    },
    description,
    keywords: DEFAULT_KEYWORDS,
    alternates: localeAlternates('/', locale),
    openGraph: {
      type: 'website',
      locale: OG_LOCALES[locale as keyof typeof OG_LOCALES] ?? OG_LOCALES.id,
      siteName: SITE_NAME,
      url: `${SITE_URL}${localePath('/', locale)}`,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@dntech',
    },
    robots: { index: true, follow: true },
    verification: {
      google: 'lxdLrBYX7xXpYbGC8M_ECWk6_vF1QgMZ_xs6lNbHHTA',
    },
    icons: {
      icon: [
        { url: '/icon.png', sizes: '32x32', type: 'image/png' },
        { url: '/rlogo2.png', sizes: '512x512', type: 'image/png' },
      ],
      shortcut: '/icon.png',
      apple: '/apple-icon.png',
    },
  };
}

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const ui = await getTranslations({ locale, namespace: 'interactive.ui' });

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <NextIntlClientProvider>
          <GlobalLoadingIndicator label={ui('loadingData')} waitLabel={ui('pleaseWait')} />
          <AnalyticsLoader
            googleAnalyticsId={
              process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || DEFAULT_GOOGLE_ANALYTICS_ID
            }
          />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
