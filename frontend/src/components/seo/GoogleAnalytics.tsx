'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GOOGLE_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;

export function isValidGoogleMeasurementId(measurementId?: string): measurementId is string {
  return Boolean(measurementId && GOOGLE_MEASUREMENT_ID_PATTERN.test(measurementId));
}

export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  if (!isValidGoogleMeasurementId(measurementId)) return null;

  return (
    <>
      <GoogleAnalyticsScripts measurementId={measurementId} />
      <GoogleAnalyticsPageViews measurementId={measurementId} />
    </>
  );
}

function GoogleAnalyticsScripts({ measurementId }: { measurementId: string }) {

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}

function GoogleAnalyticsPageViews({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const previousPageRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!pathname) return;

    const query = window.location.search.slice(1);
    const pagePath = query ? `${pathname}?${query}` : pathname;

    // The initial page view is sent by gtag('config'). Only send subsequent
    // client-side navigations to avoid double-counting the first page.
    if (previousPageRef.current === undefined) {
      previousPageRef.current = pagePath;
      return;
    }

    if (previousPageRef.current === pagePath) return;

    window.gtag?.('event', 'page_view', {
      page_path: pagePath,
      page_title: document.title,
      send_to: measurementId,
    });
    previousPageRef.current = pagePath;
  }, [measurementId, pathname]);

  return null;
}
