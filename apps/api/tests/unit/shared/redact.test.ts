import { describe, expect, it } from 'vitest';
import { redact } from '../../../src/infrastructure/mail/mailer';

describe('mailer redact', () => {
  it('hides one-time tokens in stored copies of sent emails', () => {
    expect(redact('http://x/reset-password?token=abc123')).toBe(
      'http://x/reset-password?token=[removed]',
    );
  });
});
