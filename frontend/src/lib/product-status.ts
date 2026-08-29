/**
 * Seed stores launch status in `customerCount` (e.g. "Soft launch", "Beta").
 * Only numeric values should be phrased as a customer count.
 */
export function formatProductStatusBadge(customerCount?: string | null): string | null {
  if (!customerCount?.trim()) return null;
  const trimmed = customerCount.trim();
  if (/^\d+([.,]\d+)?$/.test(trimmed)) return `${trimmed} pelanggan`;
  return trimmed;
}
