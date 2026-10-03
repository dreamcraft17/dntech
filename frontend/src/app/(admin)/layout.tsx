import type { Metadata } from 'next';
import '../globals.css';
import { GlobalLoadingIndicator } from '@/components/ui/GlobalLoadingIndicator';

export const metadata: Metadata = {
  title: 'Admin — DN Tech',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <GlobalLoadingIndicator />
        {children}
      </body>
    </html>
  );
}
