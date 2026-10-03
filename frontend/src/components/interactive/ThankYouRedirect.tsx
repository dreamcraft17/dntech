'use client';

import { useEffect } from 'react';
// Locale-aware router so the redirect keeps the visitor's /id or /en prefix.
import { useRouter } from '@/i18n/navigation';

export function ThankYouRedirect({ delayMs = 5000, href = '/blog' }: { delayMs?: number; href?: string }) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => router.push(href), delayMs);
    return () => window.clearTimeout(timer);
  }, [router, delayMs, href]);

  return null;
}
