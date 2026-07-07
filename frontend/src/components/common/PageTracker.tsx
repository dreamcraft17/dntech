'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/api';

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && !pathname.startsWith('/admin')) {
      trackPageView(pathname, document.title);
    }
  }, [pathname]);

  return null;
}
