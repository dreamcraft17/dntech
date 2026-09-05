import express from 'express';
import request from 'supertest';
import { errorHandler } from '../../utils/helpers';

jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    product: {
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

const productsRouter = require('../../routes/products').default;
const prisma = require('../../config/database').default as {
  product: { findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock };
};
const cacheService = require('../../services/CacheService').cacheService as {
  get: jest.Mock;
  set: jest.Mock;
};

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/products', productsRouter);
  app.use(errorHandler);
  return app;
}

describe('products route integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cached list when available', async () => {
    cacheService.get.mockReturnValueOnce({ products: [{ id: 'p1', slug: 'dnpeople' }], total: 1 });
    const res = await request(buildApp()).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(prisma.product.findMany).not.toHaveBeenCalled();
  });

  it('queries prisma list and caches when not searching', async () => {
    cacheService.get.mockReturnValueOnce(null);
    prisma.product.findMany.mockResolvedValueOnce([{ id: 'p1', slug: 'dnpeople' }]);
    prisma.product.count.mockResolvedValueOnce(1);
    const res = await request(buildApp()).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(prisma.product.findMany).toHaveBeenCalled();
    expect(cacheService.set).toHaveBeenCalled();
  });

  it('does not use cache for search queries', async () => {
    prisma.product.findMany.mockResolvedValueOnce([{ id: 'p2', slug: 'search-hit' }]);
    prisma.product.count.mockResolvedValueOnce(1);
    const res = await request(buildApp()).get('/api/v1/products?search=dn');
    expect(res.status).toBe(200);
    expect(cacheService.get).not.toHaveBeenCalled();
    expect(cacheService.set).not.toHaveBeenCalled();
  });

  it('returns product detail with related products', async () => {
    prisma.product.findFirst
      .mockResolvedValueOnce({ id: 'p1', slug: 'dnpeople', category: 'hr' })
      .mockResolvedValueOnce(undefined);
    prisma.product.findMany.mockResolvedValueOnce([{ id: 'p2', slug: 'other' }]);
    const res = await request(buildApp()).get('/api/v1/products/dnpeople');
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe('dnpeople');
    expect(Array.isArray(res.body.data.relatedProducts)).toBe(true);
  });

  it('returns 404 when product is missing', async () => {
    prisma.product.findFirst.mockResolvedValueOnce(null);
    const res = await request(buildApp()).get('/api/v1/products/unknown');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
