import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: {
    default: 'DN Tech - Solusi Teknologi Terpercaya',
    template: '%s | DN Tech',
  },
  description: 'DN Tech menyediakan solusi enterprise software, web development, cloud & DevOps untuk digitalisasi bisnis Anda.',
  keywords: ['technology', 'software development', 'enterprise', 'Indonesia', 'DN Tech'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'DN Tech',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
