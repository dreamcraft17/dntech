'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ThankYouRedirect({ delayMs = 5000, href = '/blog' }: { delayMs?: number; href?: string }) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => router.push(href), delayMs);
    return () => window.clearTimeout(timer);
  }, [router, delayMs, href]);

  return null;
}
