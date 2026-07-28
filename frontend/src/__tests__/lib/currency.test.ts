import {
  BUDGET_OPTIONS,
  DEV_RATES_IDR,
  QUIZ_BUDGET_OPTIONS,
  budgetRangeLabel,
  formatIDR,
  formatIDRPerHour,
  formatIDRRange,
} from '@/lib/currency';

describe('currency helpers', () => {
  it('exposes budget options', () => {
    expect(BUDGET_OPTIONS.length).toBeGreaterThan(0);
    expect(QUIZ_BUDGET_OPTIONS.length).toBeGreaterThan(0);
  });

  it('formats IDR amount and range', () => {
    expect(formatIDR(100000)).toMatch(/Rp/);
    expect(formatIDRRange(100000, 200000)).toContain('–');
    expect(formatIDRPerHour(150000)).toContain('/jam');
  });

  it('returns mapped budget labels', () => {
    expect(budgetRangeLabel('under-500jt')).toContain('500');
    expect(budgetRangeLabel('small')).toContain('500 juta');
    expect(budgetRangeLabel('500k+')).toContain('legacy');
    expect(budgetRangeLabel(undefined)).toBe('—');
    expect(budgetRangeLabel('custom-tier')).toBe('custom-tier');
  });

  it('has expected dev rates', () => {
    expect(DEV_RATES_IDR.junior).toBeGreaterThan(0);
    expect(DEV_RATES_IDR.lead).toBeGreaterThan(DEV_RATES_IDR.junior);
  });
});
