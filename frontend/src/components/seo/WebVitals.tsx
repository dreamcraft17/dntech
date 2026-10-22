'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { isValidGoogleMeasurementId } from './GoogleAnalytics';

/**
 * Reports Core Web Vitals (LCP, INP, CLS, FCP, TTFB) to GA4 so real-user
 * performance — a confirmed Google ranking signal — is actually measured
 * instead of assumed. Only sends events once GA has a valid measurement ID;
 * gtag calls are no-ops otherwise, but this avoids firing analytics events
 * nobody is configured to collect.
 */
export function WebVitals({ measurementId }: { measurementId?: string }) {
  useReportWebVitals((metric) => {
    if (!isValidGoogleMeasurementId(measurementId) || typeof window.gtag !== 'function') return;

    window.gtag('event', metric.name, {
      // GA metric values must be integers; CLS is a small decimal (e.g. 0.05)
      // so it's scaled up, matching Next.js's documented GA reporting pattern.
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      event_category: 'Web Vitals',
      non_interaction: true,
    });
  });

  return null;
}
