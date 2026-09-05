import * as Sentry from '@sentry/node';
import logger from './logger';

/**
 * Error monitoring. No-ops entirely when SENTRY_DSN is not set, so local dev
 * and CI (where no real Sentry project exists) are unaffected. Set SENTRY_DSN
 * in production to enable real error reporting.
 */
export const sentryEnabled = Boolean(process.env.SENTRY_DSN);

export function initSentry() {
  if (!sentryEnabled) return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
  });

  logger.info('Sentry error monitoring initialized');
}

export { Sentry };
