import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private useRealSMTP = false;

  constructor() {
    const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
    const port = parseInt(process.env.SMTP_PORT || '2525', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        auth: {
          user,
          pass,
        },
      });
      this.useRealSMTP = true;
      this.logger.log(
        `Nodemailer SMTP successfully configured for server ${host}:${port}.`,
      );
    } else {
      this.logger.warn(
        `SMTP credentials not found in env variables. Mock local fallback will be used.`,
      );
    }
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachments?: nodemailer.SendMailOptions['attachments'],
  ): Promise<boolean> {
    const from = process.env.SMTP_FROM || '"Gobadi App" <no-reply@gobadi.com>';

    if (this.useRealSMTP && this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          text,
          html,
          attachments,
        });
        this.logger.log(
          `Email successfully dispatched to ${to} (Subject: "${subject}").`,
        );
        return true;
      } catch (err) {
        this.logger.error(`Failed to dispatch SMTP email to ${to}`, err.stack);
        return false;
      }
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
