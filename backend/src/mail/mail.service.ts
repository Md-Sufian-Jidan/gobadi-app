import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
  contentId?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend API configured for outbound email.');
    } else {
      this.logger.warn(
        `RESEND_API_KEY not found in env variables. Mock local fallback will be used.`,
      );
    }
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachments?: MailAttachment[],
  ): Promise<boolean> {
    const from = process.env.SMTP_FROM || '"Gobadi App" <no-reply@gobadi.com>';

    if (this.resend) {
      const { error } = await this.resend.emails.send({
        from,
        to,
        subject,
        text,
        html,
        attachments,
      });

      if (error) {
        this.logger.error(
          `Failed to dispatch email to ${to} via Resend: ${error.name} - ${error.message}`,
        );
        return false;
      }

      this.logger.log(
        `Email successfully dispatched to ${to} (Subject: "${subject}").`,
      );
      return true;
    } else {
      this.logger.log(`[MOCK EMAIL DISPATCH]`);
      this.logger.log(`From: ${from}`);
      this.logger.log(`To: ${to}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Body (Plain): ${text}`);
      if (html) {
        this.logger.log(`Body (HTML): ${html}`);
      }
      this.logger.log(`[MOCK EMAIL DISPATCH COMPLETE]`);
      return true;
    }
  }
}
