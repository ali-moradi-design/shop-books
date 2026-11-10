import { describe, expect, it } from 'vitest';
import { redact } from '../../../src/infrastructure/mail/mailer';

describe('mailer redact', () => {
  it('hides one-time tokens in stored copies of sent emails', () => {
    expect(redact('http://x/reset-password?token=abc123')).toBe(
      'http://x/reset-password?token=[removed]',
    );
  });
});

describe('isStorefrontServer', () => {
  it('skips only private callers without a forwarded visitor address', async () => {
    const { isStorefrontServer } =
      await import('../../../src/interfaces/http/middleware/security/rate-limit');
    const req = (ip: string, xff?: string) =>
      ({ headers: xff ? { 'x-forwarded-for': xff } : {}, socket: { remoteAddress: ip } }) as never;
    expect(isStorefrontServer(req('172.18.0.3'))).toBe(true);
    expect(isStorefrontServer(req('172.18.0.3', '203.0.113.9'))).toBe(false);
    expect(isStorefrontServer(req('203.0.113.9'))).toBe(false);
  });
});
