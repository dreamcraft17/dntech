jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    service: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    portfolioItem: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    blogPost: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../services/CacheService', () => ({
  cacheService: { clear: jest.fn() },
}));

const prisma = require('../../config/database').default;
const { cacheService } = require('../../services/CacheService');
const {
  createService,
  updateService,
  deleteService,
  reorderServices,
  createProduct,
  createPortfolioItem,
  createBlogPost,
  updateBlogPost,
  publishBlogPost,
  deleteBlogPost,
} = require('../../services/AdminContentService');

describe('AdminContentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('services', () => {
    it('creates a service, slugifies the name, logs activity, and clears cache', async () => {
      prisma.service.create.mockResolvedValueOnce({ id: 'svc_1', name: 'Web Dev', slug: 'web-dev' });

      const result = await createService(
        { name: 'Web Dev', description: 'Building great web apps' },
        'user_1',
        '127.0.0.1'
      );

      expect(result.id).toBe('svc_1');
      expect(prisma.service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'web-dev', createdById: 'user_1' }),
        })
      );
      expect(prisma.activityLog.create).toHaveBeenCalledTimes(1);
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });

    it('rejects invalid service payloads with a ZodError', async () => {
      await expect(createService({ name: '' }, 'user_1')).rejects.toThrow();
      expect(prisma.service.create).not.toHaveBeenCalled();
    });

    it('updates a service with a partial payload', async () => {
      prisma.service.update.mockResolvedValueOnce({ id: 'svc_1', name: 'New Name' });

      const result = await updateService('svc_1', { name: 'New Name' }, 'user_1');

      expect(result.name).toBe('New Name');
      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: 'svc_1' },
        data: { name: 'New Name' },
      });
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });

    it('soft-deletes a service (sets deletedAt + archived status)', async () => {
      prisma.service.update.mockResolvedValueOnce({ id: 'svc_1' });

      await deleteService('svc_1', 'user_1', '127.0.0.1');

      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: 'svc_1' },
        data: { deletedAt: expect.any(Date), status: 'archived' },
      });
      expect(prisma.activityLog.create).toHaveBeenCalledTimes(1);
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });

    it('reorders services by index', async () => {
      prisma.service.update.mockResolvedValue({});

      await reorderServices({ ids: ['a', 'b', 'c'] });

      expect(prisma.service.update).toHaveBeenCalledTimes(3);
      expect(prisma.service.update).toHaveBeenNthCalledWith(1, { where: { id: 'a' }, data: { displayOrder: 0 } });
      expect(prisma.service.update).toHaveBeenNthCalledWith(3, { where: { id: 'c' }, data: { displayOrder: 2 } });
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe('products', () => {
    it('creates a product and parses publishedAt into a Date', async () => {
      prisma.product.create.mockResolvedValueOnce({ id: 'prod_1' });

      await createProduct(
        { name: 'dnPeople', description: 'HRIS product for everyone', publishedAt: '2026-01-01T00:00:00.000Z' },
        'user_1'
      );

      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ publishedAt: expect.any(Date) }),
        })
      );
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe('portfolio', () => {
    it('creates a portfolio item and does NOT clear the cache (preserves existing behavior)', async () => {
      prisma.portfolioItem.create.mockResolvedValueOnce({ id: 'pf_1' });

      await createPortfolioItem({ title: 'Case Study' }, 'user_1', '127.0.0.1');

      expect(prisma.portfolioItem.create).toHaveBeenCalled();
      expect(prisma.activityLog.create).toHaveBeenCalledTimes(1);
      expect(cacheService.clear).not.toHaveBeenCalled();
    });
  });

  describe('blog', () => {
    it('creates a blog post, logs activity, and clears cache', async () => {
      prisma.blogPost.create.mockResolvedValueOnce({ id: 'post_1' });

      await createBlogPost(
        { title: 'Hello', content: 'x'.repeat(120) },
        'user_1',
        '127.0.0.1'
      );

      expect(prisma.blogPost.create).toHaveBeenCalled();
      expect(prisma.activityLog.create).toHaveBeenCalledTimes(1);
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });

    it('updates a blog post WITHOUT logging activity (preserves existing behavior)', async () => {
      prisma.blogPost.update.mockResolvedValueOnce({ id: 'post_1' });

      await updateBlogPost('post_1', { title: 'Updated' });

      expect(prisma.activityLog.create).not.toHaveBeenCalled();
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });

    it('publishes a blog post, setting status + publishedAt', async () => {
      prisma.blogPost.update.mockResolvedValueOnce({ id: 'post_1', status: 'published' });

      const result = await publishBlogPost('post_1');

      expect(result.status).toBe('published');
      expect(prisma.blogPost.update).toHaveBeenCalledWith({
        where: { id: 'post_1' },
        data: { status: 'published', publishedAt: expect.any(Date) },
      });
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });

    it('soft-deletes a blog post', async () => {
      prisma.blogPost.update.mockResolvedValueOnce({ id: 'post_1' });

      await deleteBlogPost('post_1');

      expect(prisma.blogPost.update).toHaveBeenCalledWith({
        where: { id: 'post_1' },
        data: { deletedAt: expect.any(Date) },
      });
      expect(cacheService.clear).toHaveBeenCalledTimes(1);
    });
  });
});

export {};
