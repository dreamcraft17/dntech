'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/api';

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && !pathname.startsWith('/admin')) {
      const track = () => trackPageView(pathname, document.title);

      if ('requestIdleCallback' in window) {
        const idleId = window.requestIdleCallback(track, { timeout: 3000 });
        return () => window.cancelIdleCallback(idleId);
      }

      const timeoutId = setTimeout(track, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [pathname]);

  return null;
}
