'use client';

import { useEffect } from 'react';

interface CrispChatLoaderProps {
  crispWebsiteId?: string;
}

declare global {
  interface Window {
    $crisp?: unknown[];
    CRISP_WEBSITE_ID?: string;
  }
}

const INTERACTION_EVENTS = ['mousemove', 'scroll', 'touchstart', 'keydown'] as const;

export function CrispChatLoader({ crispWebsiteId }: CrispChatLoaderProps) {
  const websiteId = crispWebsiteId || process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

  useEffect(() => {
    if (!websiteId || typeof window === 'undefined') return;
    if (window.CRISP_WEBSITE_ID) return;

    function loadCrisp() {
      if (window.CRISP_WEBSITE_ID) return;

      window.$crisp = [];
      window.CRISP_WEBSITE_ID = websiteId;

      const script = document.createElement('script');
      script.src = 'https://client.crisp.chat/l.js';
      script.async = true;
      document.head.appendChild(script);

      INTERACTION_EVENTS.forEach((event) => {
        document.removeEventListener(event, loadCrisp);
      });
    }

    INTERACTION_EVENTS.forEach((event) => {
      document.addEventListener(event, loadCrisp, { once: true, passive: true });
    });

    return () => {
      INTERACTION_EVENTS.forEach((event) => {
        document.removeEventListener(event, loadCrisp);
      });
    };
  }, [websiteId]);

  return null;
}
