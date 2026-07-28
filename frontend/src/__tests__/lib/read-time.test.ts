import { estimateReadTime, formatReadTime } from '@/lib/read-time';

describe('read time helpers', () => {
  it('returns minimum 1 minute for empty content', () => {
    expect(estimateReadTime('')).toBe(1);
    expect(estimateReadTime(null)).toBe(1);
  });

  it('estimates read time by word count', () => {
    const twoHundredWords = new Array(200).fill('kata').join(' ');
    const fourHundredWords = new Array(400).fill('kata').join(' ');
    expect(estimateReadTime(twoHundredWords)).toBe(1);
    expect(estimateReadTime(fourHundredWords)).toBe(2);
  });

  it('formats read time text', () => {
    expect(formatReadTime(3)).toBe('3 menit baca');
  });
});
