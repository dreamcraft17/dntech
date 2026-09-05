import { randomUUID } from 'crypto';
import pinoHttp from 'pino-http';
import logger from '../config/logger';

/**
 * Request-ID correlation middleware. Reads an incoming X-Request-Id header
 * (or generates one), attaches it to req.id, echoes it back on the response,
 * and gives every route handler a request-scoped child logger at req.log
 * (logger.child({ requestId })) so a request's whole lifecycle can be
 * correlated in log aggregation.
 */
export const requestLogger = pinoHttp({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger: logger as any,
  genReqId(req, res) {
    const existing = req.headers['x-request-id'];
    const id = (Array.isArray(existing) ? existing[0] : existing) || randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  customLogLevel(_req, res, err) {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // Keep test output clean — logger itself is silenced in NODE_ENV=test.
  autoLogging: process.env.NODE_ENV !== 'test',
});

export default requestLogger;
