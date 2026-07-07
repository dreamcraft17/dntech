'use client';

import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api';
import { CrispChat } from './CrispChat';

export function CrispChatLoader() {
  const [websiteId, setWebsiteId] = useState<string | undefined>(
    process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID
  );

  useEffect(() => {
    if (websiteId) return;
    fetch(getApiUrl('/settings'))
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.crispWebsiteId) setWebsiteId(json.data.crispWebsiteId);
      })
      .catch(() => {});
  }, [websiteId]);

  return <CrispChat websiteId={websiteId} />;
}
