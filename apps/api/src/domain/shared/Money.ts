import { DomainError } from './DomainError';

/** Money in integer minor units (e.g. cents) with a currency code. */
export class Money {
  readonly minor: number;
  readonly currency: string;

  private constructor(minor: number, currency: string) {
    this.minor = minor;
    this.currency = currency;
  }

  static of(minor: number, currency = 'USD'): Money {
    if (!Number.isInteger(minor) || minor < 0) {
      throw new DomainError('Money must be a non-negative integer in minor units', 'VALIDATION');
    }
    return new Money(minor, currency.toUpperCase());
  }

  /** Round a computed value (e.g. a percentage) to whole minor units. */
  static round(n: number): number {
    return Math.round(n);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.of(this.minor + other.minor, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.of(Math.max(0, this.minor - other.minor), this.currency);
  }

  multiply(qty: number): Money {
    if (!Number.isFinite(qty) || qty < 0) {
      throw new DomainError('Quantity must be a non-negative finite number', 'VALIDATION');
    }
    return Money.of(this.minor * qty, this.currency);
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainError(`Currency mismatch: ${this.currency} vs ${other.currency}`, 'VALIDATION');
    }
  }
}
