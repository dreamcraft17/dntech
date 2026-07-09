import type { Metadata } from 'next';
import './globals.css';
import { SITE_URL, SITE_NAME, DEFAULT_KEYWORDS } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Solusi Teknologi Terpercaya`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'DN Tech — software house Indonesia untuk pengembangan aplikasi kustom dan konsultasi teknologi startup.',
  keywords: DEFAULT_KEYWORDS,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dntech',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/rlogo2.png',
    apple: '/rlogo2.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
