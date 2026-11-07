'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initSiteEpic } from '@/lib/site-epic';

/** Boots homepage cinematic motion (hero parallax + section reveals).
 * Re-runs on every route change: client navigation renders fresh
 * `.epic-reveal` nodes that would otherwise stay hidden (opacity 0). */
export function SiteEpicProvider() {
  const pathname = usePathname();

  useEffect(() => {
    return initSiteEpic();
  }, [pathname]);

  return null;
}
