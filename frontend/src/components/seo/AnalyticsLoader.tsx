'use client';

import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api';
import { GoogleAnalytics } from './GoogleAnalytics';

export function AnalyticsLoader() {
  const [gaId, setGaId] = useState<string | undefined>();

  useEffect(() => {
    fetch(getApiUrl('/settings'))
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.googleAnalyticsId) setGaId(json.data.googleAnalyticsId);
      })
      .catch(() => {});
  }, []);

  return <GoogleAnalytics measurementId={gaId} />;
}
