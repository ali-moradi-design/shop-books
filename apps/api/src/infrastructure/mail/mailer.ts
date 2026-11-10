import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../logging/logger';
import { prisma } from '../persistence/prisma/client';
import type { RenderedEmail } from './templates';

export type EmailStatus = 'sent' | 'outbox' | 'failed';

const log = logger.child({ module: 'mailer' });

export interface OutgoingEmail extends RenderedEmail {
  to: string;
  template: string;
}

export interface IMailer {
  /** Never throws: a failed email must not undo the order or sign-up that sent it. */
  send(email: OutgoingEmail): Promise<EmailStatus>;
}

/**
 * Sends through SMTP when SMTP_URL is set (any provider: Resend, Postmark, SES,
 * Mailpit locally). Every message is also written to the outbox collection so
 * staff can see what went out; without SMTP the outbox is where mail lands.
 */
export class Mailer implements IMailer {
  private readonly transport: Transporter | null;

  constructor(
    smtpUrl = env.SMTP_URL,
    private readonly from = env.MAIL_FROM,
  ) {
    this.transport = smtpUrl ? nodemailer.createTransport(smtpUrl) : null;
  }

  get mode(): 'smtp' | 'outbox' {
    return this.transport ? 'smtp' : 'outbox';
  }

  async send(email: OutgoingEmail): Promise<EmailStatus> {
    let status: EmailStatus = 'outbox';
    let error: string | undefined;
    if (this.transport) {
      try {
        await this.transport.sendMail({
          from: this.from,
          to: email.to,
          subject: email.subject,
          text: email.text,
          html: email.html,
        });
        status = 'sent';
      } catch (err) {
        status = 'failed';
        error = err instanceof Error ? err.message : String(err);
        log.error('email failed', { to: email.to, template: email.template, error });
      }
    }
    try {
      await prisma.emailMessage.create({
        data: { ...email, to: email.to.toLowerCase(), status, error },
      });
    } catch (err) {
      log.error('could not store email', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
    return status;
  }
}

export const mailer = new Mailer();
