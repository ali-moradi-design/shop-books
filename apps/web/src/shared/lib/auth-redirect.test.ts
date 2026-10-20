import { describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({ cookies: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

import { safeNext } from './auth';

describe('safeNext', () => {
  it('allows same-site paths only', () => {
    expect(safeNext('/cart')).toBe('/cart');
    expect(safeNext('//evil.example')).toBe('/');
    expect(safeNext('https://evil.example')).toBe('/');
    expect(safeNext(undefined)).toBe('/');
  });
});
