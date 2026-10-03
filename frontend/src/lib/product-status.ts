/**
 * Seed stores launch status in `customerCount` (e.g. "Soft launch", "Beta").
 * Only numeric values should be phrased as a customer count.
 *
 * The calculation is pure: it classifies the raw value and leaves the wording
 * to the caller's message catalog (`catalog.products.statusBadge.customers`).
 */
export type ProductStatusBadge =
  | { kind: 'count'; count: string }
  | { kind: 'label'; label: string };

export function getProductStatusBadge(customerCount?: string | null): ProductStatusBadge | null {
  if (!customerCount?.trim()) return null;
  const trimmed = customerCount.trim();
  if (/^\d+([.,]\d+)?$/.test(trimmed)) return { kind: 'count', count: trimmed };
  return { kind: 'label', label: trimmed };
}

/**
 * Renders the badge to a string. `formatCount` receives the raw numeric value
 * and should come from the active locale's messages; the Indonesian phrasing is
 * kept as the fallback so non-localised callers keep working.
 */
export function formatProductStatusBadge(
  customerCount?: string | null,
  formatCount: (count: string) => string = (count) => `${count} pelanggan`
): string | null {
  const badge = getProductStatusBadge(customerCount);
  if (!badge) return null;
  return badge.kind === 'count' ? formatCount(badge.count) : badge.label;
}
