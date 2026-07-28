import { cn, formatCurrencyIDR, formatDate, stripHtml, truncate } from '@/lib/utils';

describe('frontend lib utils', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toContain('a');
    expect(cn('a', false && 'b')).toContain('a');
  });

  it('formats date in Indonesian locale', () => {
    const value = formatDate('2026-07-28T00:00:00.000Z');
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThan(5);
  });

  it('truncates long text', () => {
    expect(truncate('abc', 10)).toBe('abc');
    expect(truncate('abcdefghij', 5)).toBe('abcde...');
  });

  it('strips html tags', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('formats rupiah values', () => {
    const result = formatCurrencyIDR(250000);
    expect(result).toMatch(/Rp/);
  });
});
