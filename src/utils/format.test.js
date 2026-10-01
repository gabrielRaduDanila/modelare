import { describe, expect, it } from 'vitest';

import { formatPValue } from './format';

describe('formatPValue', () => {
  it('reports values below 0.001 as a threshold instead of 0.000000', () => {
    expect(formatPValue(0)).toBe('< 0.001');
    expect(formatPValue(1.2e-9)).toBe('< 0.001');
    expect(formatPValue(0.0009)).toBe('< 0.001');
  });

  it('shows three decimals from 0.001 upwards', () => {
    expect(formatPValue(0.001)).toBe('0.001');
    expect(formatPValue(0.2764)).toBe('0.276');
    expect(formatPValue(1)).toBe('1.000');
  });

  it('falls back to a dash for missing values', () => {
    expect(formatPValue(null)).toBe('—');
    expect(formatPValue(undefined)).toBe('—');
    expect(formatPValue(Number.NaN)).toBe('—');
  });
});
