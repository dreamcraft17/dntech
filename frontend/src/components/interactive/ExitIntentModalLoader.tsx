'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ExitIntentModal = dynamic(
  () => import('@/components/interactive/ExitIntentModal').then((mod) => mod.ExitIntentModal),
  { ssr: false }
);

const SESSION_KEY = 'exitIntentModalShown';

export function ExitIntentModalLoader() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NEXT_PUBLIC_ENABLE_EXIT_MODAL === 'false') return;

    const isMobile =
      window.matchMedia('(max-width: 1024px)').matches ||
      window.matchMedia('(pointer: coarse)').matches;

    if (isMobile) return;
    if (sessionStorage.getItem(SESSION_KEY) === 'true') return;

    function armExitIntent(event: MouseEvent) {
      if (event.clientY > 0) return;
      setShouldLoad(true);
      document.removeEventListener('mouseleave', armExitIntent);
    }

    document.addEventListener('mouseleave', armExitIntent);
    return () => document.removeEventListener('mouseleave', armExitIntent);
  }, []);

  if (!shouldLoad) return null;

  return <ExitIntentModal autoShow />;
}
