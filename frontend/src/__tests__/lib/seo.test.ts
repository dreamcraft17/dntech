import { PAGE_SEO } from '@/lib/seo';

describe('PAGE_SEO.products', () => {
  it('keeps title and description within SERP limits and names real product categories', () => {
    const { title, description, keywords } = PAGE_SEO.products;
    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(title).toMatch(/HRIS/);
    expect(title).toMatch(/ERP/);
    expect(description).toMatch(/pembukuan/i);
    expect(description).not.toMatch(/kartu kredit|10x|no hidden fees/i);
    expect(keywords).toEqual(
      expect.arrayContaining(['HRIS Indonesia', 'ERP software Indonesia', 'pembukuan Shopee']),
    );
  });
});
