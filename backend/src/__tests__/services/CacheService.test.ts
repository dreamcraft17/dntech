import { cacheService } from '../../services/CacheService';

describe('CacheService', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  it('stores and retrieves values', () => {
    cacheService.set('k1', { hello: 'world' }, 30);
    expect(cacheService.get<{ hello: string }>('k1')).toEqual({ hello: 'world' });
  });

  it('returns null for missing key', () => {
    expect(cacheService.get('none')).toBeNull();
  });

  it('expires entries by TTL', async () => {
    cacheService.set('k2', 'short', 0);
    await new Promise((resolve) => setTimeout(resolve, 2));
    expect(cacheService.get('k2')).toBeNull();
  });

  it('clears one key or all', () => {
    cacheService.set('a', 1, 30);
    cacheService.set('b', 2, 30);
    cacheService.clear('a');
    expect(cacheService.get('a')).toBeNull();
    expect(cacheService.get('b')).toBe(2);
    cacheService.clear();
    expect(cacheService.get('b')).toBeNull();
  });
});
