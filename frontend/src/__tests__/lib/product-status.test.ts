import { formatProductStatusBadge } from '@/lib/product-status';

describe('formatProductStatusBadge', () => {
  it('returns null for empty values', () => {
    expect(formatProductStatusBadge(undefined)).toBeNull();
    expect(formatProductStatusBadge('')).toBeNull();
    expect(formatProductStatusBadge('   ')).toBeNull();
  });

  it('phrases numeric counts as pelanggan', () => {
    expect(formatProductStatusBadge('1')).toBe('1 pelanggan');
    expect(formatProductStatusBadge('12')).toBe('12 pelanggan');
  });

  it('leaves launch status strings unchanged', () => {
    expect(formatProductStatusBadge('Soft launch')).toBe('Soft launch');
    expect(formatProductStatusBadge('Beta')).toBe('Beta');
    expect(formatProductStatusBadge('Beta UAT')).toBe('Beta UAT');
    expect(formatProductStatusBadge('1 client')).toBe('1 client');
  });
});
