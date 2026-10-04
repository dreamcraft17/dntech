import express from 'express';
import request from 'supertest';
import { errorHandler } from '../../utils/helpers';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    service: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('../../services/CacheService', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const servicesRouter = require('../../routes/services').default;
const prisma = require('../../config/database').default as {
  service: { findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock };
};
const cacheService = require('../../services/CacheService').cacheService as {
  get: jest.Mock;
  set: jest.Mock;
};

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/services', servicesRouter);
  app.use(errorHandler);
  return app;
}

const indonesianService = {
  id: 's1',
  locale: 'id',
  name: 'Pengembangan Aplikasi Custom',
  slug: 'pengembangan-aplikasi-custom',
  description: 'Kami membangun aplikasi sesuai kebutuhan bisnis Anda.',
  features: [{ title: 'Konsultasi gratis' }],
  iconUrl: null,
  category: 'Development',
  displayOrder: 1,
  seoTitle: null,
  seoDescription: null,
  translations: [
    {
      locale: 'en',
      name: 'Custom Application Development',
      slug: 'custom-application-development',
      description: 'We build applications tailored to your business needs.',
      features: [{ title: 'Free consultation' }],
      category: 'Development',
      isMachine: true,
    },
  ],
};

function whereText(call: unknown) {
  return JSON.stringify(call);
}

describe('services route locale behaviour', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cacheService.get.mockReturnValue(null);
  });

  describe('GET /', () => {
    it('resolves every item into the requested locale and strips translations', async () => {
      prisma.service.findMany.mockResolvedValueOnce([indonesianService]);
      prisma.service.count.mockResolvedValueOnce(1);

      const res = await request(buildApp()).get('/api/v1/services?locale=en');

      expect(res.status).toBe(200);
      expect(res.body.data[0]).toMatchObject({
        name: 'Custom Application Development',
        slug: 'custom-application-development',
        category: 'Development',
        locale: 'en',
        requestedLocale: 'en',
        isMachineTranslated: true,
        isFallback: false,
        availableLocales: ['id', 'en'],
      });
      expect(res.body.data[0].translations).toBeUndefined();
    });

    it('falls back to the Accept-Language header, then to id', async () => {
      prisma.service.findMany.mockResolvedValue([indonesianService]);
      prisma.service.count.mockResolvedValue(1);

      const viaHeader = await request(buildApp())
        .get('/api/v1/services')
        .set('Accept-Language', 'en-US,en;q=0.9');
      expect(viaHeader.body.data[0].name).toBe('Custom Application Development');

      const viaDefault = await request(buildApp()).get('/api/v1/services');
      expect(viaDefault.body.data[0].name).toBe('Pengembangan Aplikasi Custom');
      expect(viaDefault.body.data[0].requestedLocale).toBe('id');
    });

    it('keys the list cache by locale', async () => {
      prisma.service.findMany.mockResolvedValue([indonesianService]);
      prisma.service.count.mockResolvedValue(1);

      await request(buildApp()).get('/api/v1/services?locale=en');
      expect(cacheService.get).toHaveBeenCalledWith('services:list:en:all:1:100');

      await request(buildApp()).get('/api/v1/services?locale=id&category=Development&page=2');
      expect(cacheService.get).toHaveBeenCalledWith('services:list:id:Development:2:100');
    });

    it('never serves an id cache entry to an en visitor', async () => {
      cacheService.get.mockImplementation((key: string) =>
        key === 'services:list:id:all:1:100' ? { services: [{ name: 'Pengembangan Aplikasi Custom' }], total: 1 } : null
      );
      prisma.service.findMany.mockResolvedValueOnce([indonesianService]);
      prisma.service.count.mockResolvedValueOnce(1);

      const res = await request(buildApp()).get('/api/v1/services?locale=en');

      expect(res.body.data[0].name).toBe('Custom Application Development');
      expect(prisma.service.findMany).toHaveBeenCalled();
    });

    it('searches translated text as well as the base row', async () => {
      prisma.service.findMany.mockResolvedValueOnce([indonesianService]);
      prisma.service.count.mockResolvedValueOnce(1);

      await request(buildApp()).get('/api/v1/services?locale=en&search=consultation');

      const where = whereText(prisma.service.findMany.mock.calls[0][0].where);
      expect(where).toContain('translations');
      expect(where).toContain('"locale":"en"');
      expect(where).toContain('consultation');
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('filters by the category as it reads in the requested locale, and combines with search', async () => {
      prisma.service.findMany.mockResolvedValueOnce([indonesianService]);
      prisma.service.count.mockResolvedValueOnce(1);

      await request(buildApp()).get('/api/v1/services?locale=en&category=Development&search=app');

      const where = whereText(prisma.service.findMany.mock.calls[0][0].where);
      expect(where).toContain('"category":"Development"');
      expect(where).toContain('app');
      expect(JSON.parse(where).AND).toHaveLength(2);
    });
  });

  describe('GET /:slug', () => {
    it('resolves either locale\'s slug and localizes related services', async () => {
      prisma.service.findFirst.mockResolvedValueOnce(indonesianService);
      prisma.service.findMany.mockResolvedValueOnce([]);

      const res = await request(buildApp()).get('/api/v1/services/custom-application-development?locale=en');

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Custom Application Development');
      expect(res.body.data.locale).toBe('en');

      const where = whereText(prisma.service.findFirst.mock.calls[0][0].where);
      expect(where).toContain('custom-application-development');
    });

    it('returns 404 when nothing matches', async () => {
      prisma.service.findFirst.mockResolvedValueOnce(null);

      const res = await request(buildApp()).get('/api/v1/services/does-not-exist');
      expect(res.status).toBe(404);
    });
  });
});
