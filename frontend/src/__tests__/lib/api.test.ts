import { asArray, getApiBaseUrl } from '@/lib/api';

describe('api helpers', () => {
  it('returns safe array from nullish values', () => {
    expect(asArray(null)).toEqual([]);
    expect(asArray(undefined)).toEqual([]);
    expect(asArray([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('returns configured API base URL', () => {
    expect(typeof getApiBaseUrl()).toBe('string');
    expect(getApiBaseUrl().length).toBeGreaterThan(0);
  });
});
