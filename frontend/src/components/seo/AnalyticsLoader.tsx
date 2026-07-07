'use client';

import { useEffect, useState } from 'react';
import { GoogleAnalytics } from './GoogleAnalytics';

interface AnalyticsLoaderProps {
  googleAnalyticsId?: string;
}

export function AnalyticsLoader({ googleAnalyticsId }: AnalyticsLoaderProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!googleAnalyticsId) return;

    const load = () => setShouldLoad(true);

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(load, { timeout: 3000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(load, 2000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [googleAnalyticsId]);

  return shouldLoad ? <GoogleAnalytics measurementId={googleAnalyticsId} /> : null;
}
