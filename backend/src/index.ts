import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import servicesRoutes from './routes/services';
import portfolioRoutes from './routes/portfolio';
import blogRoutes from './routes/blog';
import formsRoutes from './routes/forms';
import teamRoutes from './routes/team';
import testimonialsRoutes from './routes/testimonials';
import faqRoutes from './routes/faq';
import settingsRoutes from './routes/settings';
import careersRoutes from './routes/careers';
import analyticsRoutes from './routes/analytics';
import searchRoutes from './routes/search';
import leadsRoutes from './routes/leads';
import caseStudiesRoutes from './routes/case-studies';
import newsletterRoutes from './routes/newsletter';
import quizRoutes from './routes/quiz';
import adminRoutes from './routes/admin';
import brandingRoutes from './routes/branding';
import { errorHandler } from './utils/helpers';

function buildAllowedOrigins(): string[] {
  const origins = new Set<string>();
  const raw = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  for (const origin of raw) {
    origins.add(origin);
    try {
      const url = new URL(origin);
      const port = url.port ? `:${url.port}` : '';
      const base = `${url.protocol}//`;
      const host = url.hostname;
      if (host.startsWith('www.')) {
        origins.add(`${base}${host.slice(4)}${port}`);
      } else if (host !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
        origins.add(`${base}www.${host}${port}`);
      }
    } catch {
      // ignore invalid URL entries
    }
  }

  return [...origins];
}

const app = express();
const PORT = process.env.PORT || 4000;

// Required when behind Nginx/reverse proxy (X-Forwarded-For) — fixes express-rate-limit ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
if (process.env.TRUST_PROXY !== 'false') {
  app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = buildAllowedOrigins();

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});
app.use('/api/v1', apiLimiter);

const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const v1 = express.Router();
v1.use('/auth', authRoutes);
v1.use('/services', servicesRoutes);
v1.use('/portfolio', portfolioRoutes);
v1.use('/blog', blogRoutes);
v1.use('/forms', formsRoutes);
v1.use('/team', teamRoutes);
v1.use('/testimonials', testimonialsRoutes);
v1.use('/faq', faqRoutes);
v1.use('/settings', settingsRoutes);
v1.use('/careers', careersRoutes);
v1.use('/analytics', analyticsRoutes);
v1.use('/search', searchRoutes);
v1.use('/leads', leadsRoutes);
v1.use('/case-studies', caseStudiesRoutes);
v1.use('/newsletter', newsletterRoutes);
v1.use('/quiz', quizRoutes);
v1.use('/admin', adminRoutes);
v1.use('/branding', brandingRoutes);

app.use('/api/v1', v1);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`DN Tech API running on http://localhost:${PORT}`);
});

export default app;
