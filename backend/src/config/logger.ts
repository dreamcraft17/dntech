import pino from 'pino';

/**
 * Structured logging singleton for the backend. Replaces raw console.log /
 * console.error / console.warn calls across backend/src (test files and
 * CLI scripts under backend/scripts/ are intentionally excluded).
 *
 * Emits JSON lines everywhere (safe for log aggregation / shipping to a log
 * collector); silenced in the `test` environment so Jest output stays clean.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'silent' : 'info'),
});

export default logger;
