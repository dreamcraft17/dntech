'use client';

import Script from 'next/script';

const GOOGLE_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;

export function isValidGoogleMeasurementId(measurementId?: string): measurementId is string {
  return Boolean(measurementId && GOOGLE_MEASUREMENT_ID_PATTERN.test(measurementId));
}

export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  if (!isValidGoogleMeasurementId(measurementId)) return null;

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
