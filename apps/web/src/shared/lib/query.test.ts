import { describe, expect, it } from 'vitest';
import { firstParam, toQuery } from './query';

describe('toQuery', () => {
  it('skips empty values and encodes the rest', () => {
    expect(toQuery({ q: 'war & peace', page: undefined, inStock: false, sort: 'price-asc' })).toBe(
      '?q=war+%26+peace&sort=price-asc',
    );
    expect(toQuery({})).toBe('');
  });
  it('keeps true booleans and zero', () => {
    expect(toQuery({ featured: true, min: 0 })).toBe('?featured=true&min=0');
  });
});

describe('firstParam', () => {
  it('takes the first of an array', () => {
    expect(firstParam(['a', 'b'])).toBe('a');
    expect(firstParam('x')).toBe('x');
    expect(firstParam(undefined)).toBeUndefined();
  });
});
