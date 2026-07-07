/** Shared budget tiers for forms (values stored in leads DB). */
export const BUDGET_OPTIONS = [
  { value: 'under-500jt', label: 'Di bawah Rp 500 juta' },
  { value: '500jt-1m', label: 'Rp 500 juta – Rp 1 miliar' },
  { value: '1m-5m', label: 'Rp 1 miliar – Rp 5 miliar' },
  { value: '5m-plus', label: 'Rp 5 miliar+' },
] as const;

export const QUIZ_BUDGET_OPTIONS = [
  { value: 'small', label: 'Di bawah Rp 500 juta' },
  { value: 'medium', label: 'Rp 500 juta – Rp 2 miliar' },
  { value: 'large', label: 'Rp 2 miliar – Rp 5 miliar' },
  { value: 'enterprise-budget', label: 'Rp 5 miliar+' },
] as const;

export const DEV_RATES_IDR = {
  junior: 150_000,
  mid: 250_000,
  senior: 400_000,
  lead: 550_000,
} as const;

export const IN_HOUSE_RATE_IDR = 350_000;

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

/** Format amount as Rp (e.g. Rp 250.000). */
export function formatIDR(amount: number): string {
  return idrFormatter.format(amount);
}

/** Format range for calculator results. */
export function formatIDRRange(min: number, max: number): string {
  return `${formatIDR(min)} – ${formatIDR(max)}`;
}

/** Hourly rate label for selects. */
export function formatIDRPerHour(amount: number): string {
  return `${formatIDR(amount)}/jam`;
}

/** Human-readable label for stored budget range values (incl. legacy USD keys). */
export function budgetRangeLabel(value?: string | null): string {
  if (!value) return '—';
  const found = BUDGET_OPTIONS.find((o) => o.value === value);
  if (found) return found.label;

  const legacy: Record<string, string> = {
    'under-50k': 'Di bawah Rp 500 juta (legacy)',
    '50k-100k': 'Rp 500 juta – Rp 1 miliar (legacy)',
    '100k-500k': 'Rp 1 miliar – Rp 5 miliar (legacy)',
    '500k+': 'Rp 5 miliar+ (legacy)',
    small: 'Di bawah Rp 500 juta',
    medium: 'Rp 500 juta – Rp 2 miliar',
    large: 'Rp 2 miliar – Rp 5 miliar',
    'enterprise-budget': 'Rp 5 miliar+',
  };
  return legacy[value] || value;
}
