'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

interface CrispChatProps {
  websiteId?: string;
}

export function CrispChat({ websiteId }: CrispChatProps) {
  const id = websiteId || process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

  useEffect(() => {
    if (!id || typeof window === 'undefined') return;
    if (window.CRISP_WEBSITE_ID) return;

    window.$crisp = [];
    window.CRISP_WEBSITE_ID = id;

    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);
  }, [id]);

  return null;
}
