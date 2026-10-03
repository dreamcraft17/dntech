import express from 'express';
import request from 'supertest';
import { errorHandler } from '../../utils/helpers';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    blogPost: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../services/CacheService', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const blogRouter = require('../../routes/blog').default;
const prisma = require('../../config/database').default as {
  blogPost: { findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock; update: jest.Mock };
};
const cacheService = require('../../services/CacheService').cacheService as {
  get: jest.Mock;
  set: jest.Mock;
};

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/blog', blogRouter);
  app.use(errorHandler);
  return app;
}

const indonesianPost = {
  id: 'p1',
  locale: 'id',
  title: 'Gaji karyawan otomatis',
  slug: 'gaji-karyawan-otomatis',
  content: 'Konten penggajian',
  excerpt: 'Ringkasan',
  category: 'Teknologi',
  viewCount: 3,
  translations: [
    {
      locale: 'en',
      title: 'Automated payroll',
      slug: 'automated-payroll',
      content: 'Payroll content',
      excerpt: 'Summary',
      category: 'Technology',
      isMachine: true,
    },
  ],
};

/** Collapses a prisma `where` tree into a string so nested clauses are easy to assert on. */
function whereText(call: unknown) {
  return JSON.stringify(call);
}

describe('blog route locale behaviour', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cacheService.get.mockReturnValue(null);
  });

  describe('GET /', () => {
    it('resolves every item into the requested locale and strips translations', async () => {
      prisma.blogPost.findMany.mockResolvedValueOnce([indonesianPost]);
      prisma.blogPost.count.mockResolvedValueOnce(1);

      const res = await request(buildApp()).get('/api/v1/blog?locale=en');

      expect(res.status).toBe(200);
      expect(res.body.data[0]).toMatchObject({
        title: 'Automated payroll',
        slug: 'automated-payroll',
        category: 'Technology',
        locale: 'en',
        requestedLocale: 'en',
        isMachineTranslated: true,
        isFallback: false,
        availableLocales: ['id', 'en'],
      });
      expect(res.body.data[0].translations).toBeUndefined();
      expect(res.body.pagination).toMatchObject({ page: 1, pageSize: 20, total: 1 });
    });

    it('falls back to the Accept-Language header, then to id', async () => {
      prisma.blogPost.findMany.mockResolvedValue([indonesianPost]);
      prisma.blogPost.count.mockResolvedValue(1);

      const viaHeader = await request(buildApp())
        .get('/api/v1/blog')
        .set('Accept-Language', 'en-US,en;q=0.9');
      expect(viaHeader.body.data[0].title).toBe('Automated payroll');

      const viaDefault = await request(buildApp()).get('/api/v1/blog');
      expect(viaDefault.body.data[0].title).toBe('Gaji karyawan otomatis');
      expect(viaDefault.body.data[0].requestedLocale).toBe('id');
    });

    it('keys the list cache by locale', async () => {
      prisma.blogPost.findMany.mockResolvedValue([indonesianPost]);
      prisma.blogPost.count.mockResolvedValue(1);

      await request(buildApp()).get('/api/v1/blog?locale=en');
      expect(cacheService.get).toHaveBeenCalledWith('blog:list:en:all:1:20');
      expect(cacheService.set).toHaveBeenCalledWith('blog:list:en:all:1:20', expect.anything(), 900);

      await request(buildApp()).get('/api/v1/blog?locale=id&category=Teknologi&page=2');
      expect(cacheService.get).toHaveBeenCalledWith('blog:list:id:Teknologi:2:20');
    });

    it('never serves an id cache entry to an en visitor', async () => {
      cacheService.get.mockImplementation((key: string) =>
        key === 'blog:list:id:all:1:20' ? { posts: [{ title: 'Gaji karyawan otomatis' }], total: 1 } : null
      );
      prisma.blogPost.findMany.mockResolvedValueOnce([indonesianPost]);
      prisma.blogPost.count.mockResolvedValueOnce(1);

      const res = await request(buildApp()).get('/api/v1/blog?locale=en');

      expect(res.body.data[0].title).toBe('Automated payroll');
      expect(prisma.blogPost.findMany).toHaveBeenCalled();
    });

    it('searches translated text as well as the base row', async () => {
      prisma.blogPost.findMany.mockResolvedValueOnce([indonesianPost]);
      prisma.blogPost.count.mockResolvedValueOnce(1);

      await request(buildApp()).get('/api/v1/blog?locale=en&search=payroll');

      const where = whereText(prisma.blogPost.findMany.mock.calls[0][0].where);
      expect(where).toContain('translations');
      expect(where).toContain('"locale":"en"');
      expect(where).toContain('payroll');
      // a search request must not poison the cache
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('filters by the category as it reads in the requested locale', async () => {
      prisma.blogPost.findMany.mockResolvedValueOnce([indonesianPost]);
      prisma.blogPost.count.mockResolvedValueOnce(1);

      await request(buildApp()).get('/api/v1/blog?locale=en&category=Technology');

      const where = whereText(prisma.blogPost.findMany.mock.calls[0][0].where);
      expect(where).toContain('"category":"Technology"');
      expect(where).toContain('translations');
    });
  });

  describe('GET /categories', () => {
    it('returns categories as they read in the requested locale', async () => {
      prisma.blogPost.findMany.mockResolvedValueOnce([
        { locale: 'id', category: 'Teknologi', translations: [{ locale: 'en', category: 'Technology' }] },
        { locale: 'id', category: 'Bisnis', translations: [] },
        { locale: 'en', category: 'Marketing', translations: [] },
      ]);

      const res = await request(buildApp()).get('/api/v1/blog/categories?locale=en');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(['Bisnis', 'Marketing', 'Technology']);
      expect(cacheService.get).toHaveBeenCalledWith('blog:categories:en');
      expect(cacheService.set).toHaveBeenCalledWith('blog:categories:en', expect.anything(), 900);
    });

    it('keeps the id categories on a separate cache key', async () => {
      prisma.blogPost.findMany.mockResolvedValueOnce([
        { locale: 'id', category: 'Teknologi', translations: [{ locale: 'en', category: 'Technology' }] },
      ]);

      const res = await request(buildApp()).get('/api/v1/blog/categories');

      expect(res.body.data).toEqual(['Teknologi']);
      expect(cacheService.get).toHaveBeenCalledWith('blog:categories:id');
    });
  });

  describe('GET /:slug', () => {
    it('resolves a translation slug and the related posts into the same locale', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce(indonesianPost);
      prisma.blogPost.update.mockResolvedValueOnce({});
      prisma.blogPost.findMany.mockResolvedValueOnce([
        {
          id: 'p2',
          locale: 'id',
          title: 'Artikel lain',
          slug: 'artikel-lain',
          content: 'isi',
          category: 'Teknologi',
          translations: [
            {
              locale: 'en',
              title: 'Another article',
              slug: 'another-article',
              content: 'body',
              isMachine: false,
            },
          ],
        },
      ]);

      const res = await request(buildApp()).get('/api/v1/blog/automated-payroll?locale=en');

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Automated payroll');
      expect(res.body.data.translations).toBeUndefined();
      expect(res.body.data.relatedPosts[0]).toMatchObject({
        title: 'Another article',
        slug: 'another-article',
        locale: 'en',
        isMachineTranslated: false,
      });

      const where = whereText(prisma.blogPost.findFirst.mock.calls[0][0].where);
      expect(where).toContain('automated-payroll');
      expect(where).toContain('translations');
    });

    it('increments the view count on the base row', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce(indonesianPost);
      prisma.blogPost.update.mockResolvedValueOnce({});
      prisma.blogPost.findMany.mockResolvedValueOnce([]);

      await request(buildApp()).get('/api/v1/blog/automated-payroll?locale=en');

      expect(prisma.blogPost.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { viewCount: { increment: 1 } },
      });
    });

    it('still resolves legacy posts with an empty slug', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce(null);
      prisma.blogPost.findMany
        .mockResolvedValueOnce([{ ...indonesianPost, slug: '' }])
        .mockResolvedValueOnce([]);
      prisma.blogPost.update.mockResolvedValueOnce({});

      const res = await request(buildApp()).get('/api/v1/blog/gaji-karyawan-otomatis?locale=id');

      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe('gaji-karyawan-otomatis');
    });

    it('404s when nothing matches', async () => {
      prisma.blogPost.findFirst.mockResolvedValueOnce(null);
      prisma.blogPost.findMany.mockResolvedValueOnce([]);

      const res = await request(buildApp()).get('/api/v1/blog/missing?locale=en');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
