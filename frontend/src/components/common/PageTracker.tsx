'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { trackPageView } from '@/lib/api';

export function PageTracker() {
  // Locale-stripped pathname, so /id/blog and /en/blog aggregate on one page key.
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (pathname && !pathname.startsWith('/admin')) {
      const track = () => trackPageView(pathname, `${document.title} [${locale}]`);

      if ('requestIdleCallback' in window) {
        const idleId = window.requestIdleCallback(track, { timeout: 3000 });
        return () => window.cancelIdleCallback(idleId);
      }

      const timeoutId = setTimeout(track, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [pathname, locale]);

  return null;
}
