/**
 * Client-side Sentry init, auto-loaded by Next.js. Only initializes when
 * NEXT_PUBLIC_SENTRY_DSN is set at build time, so local dev/CI builds (no
 * real Sentry project) are completely unaffected.
 */
import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || 0.1),
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
