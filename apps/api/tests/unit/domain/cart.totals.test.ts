import { describe, expect, it } from 'vitest';
import {
  computeSubtotal,
  computeOrderTotal,
  mergeCartItem,
  assertCartNotEmpty,
} from '../../../src/domain/cart/rules/cart.totals';
import { DomainError } from '../../../src/domain/shared/DomainError';

describe('cart totals', () => {
  it('merges items and computes totals', () => {
    const items = mergeCartItem([], 'a', 2);
    const merged = mergeCartItem(items, 'a', 1);
    expect(merged[0].quantity).toBe(3);

    const sub = computeSubtotal([{ bookId: 'a', title: 'A', price: 1050, quantity: 2 }]);
    expect(sub).toBe(2100);
    expect(computeOrderTotal(2100, 500)).toBe(1600);
  });

  it('rejects empty cart', () => {
    expect(() => assertCartNotEmpty([])).toThrow(DomainError);
  });
});
