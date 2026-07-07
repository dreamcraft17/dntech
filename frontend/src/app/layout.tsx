import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SITE_URL, SITE_NAME, DEFAULT_KEYWORDS } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Solusi Teknologi Terpercaya`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'DN Tech menyediakan solusi enterprise software, web development, cloud & DevOps untuk digitalisasi bisnis Anda.',
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
