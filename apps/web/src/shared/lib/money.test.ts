import { describe, expect, it } from 'vitest';
import { formatMoney } from './money';

describe('formatMoney', () => {
  it('formats integer minor units with Intl', () => {
    expect(formatMoney(1799)).toBe('$17.99');
    expect(formatMoney(5)).toBe('$0.05');
    expect(formatMoney(100000, 'EUR')).toBe('€1,000.00');
  });
});
