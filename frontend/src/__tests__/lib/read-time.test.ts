import { estimateReadTime } from '@/lib/read-time';
import idCatalog from '@/messages/id/catalog.json';
import enCatalog from '@/messages/en/catalog.json';

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

  it('keeps the read-time wording in the message catalogs', () => {
    expect(idCatalog.catalog.common.readTime).toBe('{minutes} menit baca');
    expect(enCatalog.catalog.common.readTime).toBe('{minutes} min read');
  });
});
