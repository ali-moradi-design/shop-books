import { describe, expect, it } from 'vitest';
import { Money } from '../../../src/domain/shared/Money';
import { normalizeEmail } from '../../../src/domain/shared/Email';
import { normalizeIsbn, isValidIsbn } from '../../../src/domain/shared/Isbn';
import { DomainError } from '../../../src/domain/shared/DomainError';

describe('value helpers', () => {
  it('Money holds integer minor units, rounds percentages and subtracts', () => {
    expect(() => Money.of(10.5)).toThrow();
    expect(Money.of(Money.round(1012.5)).minor).toBe(1013);
    expect(Money.of(1000).subtract(Money.of(300)).minor).toBe(700);
  });

  it('Email / ISBN', () => {
    expect(normalizeEmail('  A@B.COM ')).toBe('a@b.com');
    expect(() => normalizeEmail('bad')).toThrow(DomainError);
    expect(isValidIsbn('978-0-13-235088-4')).toBe(true);
    expect(normalizeIsbn('9780132350884')).toBe('9780132350884');
  });
});
