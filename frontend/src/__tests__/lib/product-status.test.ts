import { formatProductStatusBadge, getProductStatusBadge } from '@/lib/product-status';
import idCatalog from '@/messages/id/catalog.json';
import enCatalog from '@/messages/en/catalog.json';

describe('getProductStatusBadge', () => {
  it('returns null for empty values', () => {
    expect(getProductStatusBadge(undefined)).toBeNull();
    expect(getProductStatusBadge('')).toBeNull();
    expect(getProductStatusBadge('   ')).toBeNull();
  });

  it('classifies numeric values as a customer count', () => {
    expect(getProductStatusBadge('0')).toEqual({ kind: 'count', count: '0' });
    expect(getProductStatusBadge('12')).toEqual({ kind: 'count', count: '12' });
    expect(getProductStatusBadge('1.5')).toEqual({ kind: 'count', count: '1.5' });
  });

  it('classifies everything else as a launch status label', () => {
    expect(getProductStatusBadge('Soft launch')).toEqual({ kind: 'label', label: 'Soft launch' });
    expect(getProductStatusBadge('1 client')).toEqual({ kind: 'label', label: '1 client' });
    expect(getProductStatusBadge('50+')).toEqual({ kind: 'label', label: '50+' });
  });
});

describe('formatProductStatusBadge', () => {
  it('returns null for empty values', () => {
    expect(formatProductStatusBadge(undefined)).toBeNull();
    expect(formatProductStatusBadge('')).toBeNull();
    expect(formatProductStatusBadge('   ')).toBeNull();
  });

  it('phrases numeric counts with the Indonesian fallback', () => {
    expect(formatProductStatusBadge('0')).toBe('0 pelanggan');
    expect(formatProductStatusBadge('1')).toBe('1 pelanggan');
    expect(formatProductStatusBadge('12')).toBe('12 pelanggan');
    expect(formatProductStatusBadge('1.5')).toBe('1.5 pelanggan');
  });

  it('uses the supplied locale formatter for numeric counts', () => {
    expect(formatProductStatusBadge('12', (count) => `${count} customers`)).toBe('12 customers');
  });

  it('leaves launch status strings unchanged', () => {
    expect(formatProductStatusBadge('Soft launch')).toBe('Soft launch');
    expect(formatProductStatusBadge('Beta')).toBe('Beta');
    expect(formatProductStatusBadge('Beta UAT')).toBe('Beta UAT');
    expect(formatProductStatusBadge('1 client')).toBe('1 client');
    expect(formatProductStatusBadge('50+')).toBe('50+');
  });

  it('keeps the customer-count wording in the message catalogs', () => {
    expect(idCatalog.catalog.products.statusBadge.customers).toBe('{count} pelanggan');
    expect(enCatalog.catalog.products.statusBadge.customers).toBe('{count} customers');
  });
});
