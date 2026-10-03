import express from 'express';
import request from 'supertest';
import { errorHandler } from '../../utils/helpers';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    service: { findMany: jest.fn() },
    product: { findMany: jest.fn() },
    blogPost: { findMany: jest.fn() },
    faq: { findMany: jest.fn() },
    portfolioItem: { findMany: jest.fn() },
  },
}));

const searchRouter = require('../../routes/search').default;
const prisma = require('../../config/database').default as Record<string, { findMany: jest.Mock }>;

function buildApp() {
  const app = express();
  app.use('/api/v1/search', searchRouter);
  app.use(errorHandler);
  return app;
}

const translatedPost = {
  id: 'p1',
  locale: 'id',
  title: 'Gaji karyawan otomatis',
  slug: 'gaji-karyawan-otomatis',
  content: 'Konten penggajian',
  excerpt: 'Ringkasan',
  translations: [
    {
      locale: 'en',
      title: 'Automated payroll',
      slug: 'automated-payroll',
      content: 'Payroll content',
      excerpt: 'Summary',
      isMachine: true,
    },
  ],
};

describe('global search blog locale behaviour', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const model of ['service', 'product', 'faq', 'portfolioItem']) {
      prisma[model].findMany.mockResolvedValue([]);
    }
    prisma.blogPost.findMany.mockResolvedValue([translatedPost]);
  });

  it('returns blog hits in the requested locale', async () => {
    const res = await request(buildApp()).get('/api/v1/search?q=payroll&locale=en');

    expect(res.status).toBe(200);
    expect(res.body.data).toContainEqual({
      type: 'blog',
      title: 'Automated payroll',
      snippet: 'Summary',
      url: '/blog/automated-payroll',
    });
  });

  it('searches translated text, not only the base row', async () => {
    await request(buildApp()).get('/api/v1/search?q=payroll&locale=en');

    const where = JSON.stringify(prisma.blogPost.findMany.mock.calls[0][0].where);
    expect(where).toContain('translations');
    expect(where).toContain('"locale":"en"');
    expect(where).toContain('payroll');
  });

  it('defaults to id, honouring Accept-Language when no param is given', async () => {
    const indonesian = await request(buildApp()).get('/api/v1/search?q=gaji');
    expect(indonesian.body.data[0].title).toBe('Gaji karyawan otomatis');

    const english = await request(buildApp())
      .get('/api/v1/search?q=gaji')
      .set('Accept-Language', 'en-GB,en;q=0.8');
    expect(english.body.data[0].title).toBe('Automated payroll');
  });

  it('ignores queries shorter than two characters', async () => {
    const res = await request(buildApp()).get('/api/v1/search?q=a&locale=en');

    expect(res.body.data).toEqual([]);
    expect(prisma.blogPost.findMany).not.toHaveBeenCalled();
  });
});
