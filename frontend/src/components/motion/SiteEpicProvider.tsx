'use client';

import { useEffect } from 'react';
import { initSiteEpic } from '@/lib/site-epic';

/** Boots homepage cinematic motion (hero parallax + section reveals). */
export function SiteEpicProvider() {
  useEffect(() => {
    initSiteEpic();
  }, []);

  return null;
}
