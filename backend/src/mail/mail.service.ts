import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// ─── ORIGINAL RESEND IMPORT (commented out for reference) ───────────────────
// import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
  contentId?: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  // ─── ORIGINAL RESEND CLIENT (commented out for reference) ───────────────
  // private resend: Resend | null = null;

  onModuleInit() {
    // ─── ORIGINAL RESEND SETUP (commented out for reference) ─────────────
    // const apiKey = process.env.RESEND_API_KEY;
    // if (apiKey) {
    //   this.resend = new Resend(apiKey);
    //   this.logger.log('Resend API configured for outbound email.');
    // } else {
    //   this.logger.warn(
    //     `RESEND_API_KEY not found in env variables. Mock local fallback will be used.`,
    //   );
    // }

    // ─── GMAIL OAuth2 CLIENT SETUP ────────────────────────────────────────
    const clientId = process.env.GMAIL_API_CLIENT_ID;
    const clientSecret = process.env.GMAIL_API_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_API_REFRESH_TOKEN;
    const gmailUser = process.env.GMAIL_USER;

    if (clientId && clientSecret && refreshToken && gmailUser) {
      // Single transporter instance — Nodemailer automatically manages
      // access token generation and refresh using these credentials.
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: gmailUser,
          clientId,
          clientSecret,
          refreshToken,
        },
      });

      this.logger.log('Gmail OAuth2 configured for outbound email.');
    } else {
      this.logger.warn(
        'Gmail OAuth2 env vars missing. Mock local fallback will be used.',
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
    const from = process.env.GMAIL_USER || '"Gobadi App" <no-reply@gobadi.com>';

    // ─── GMAIL OAuth2 NODEMAILER SEND ───────────────────────────────────
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          text,
          html,
          attachments,
        });

        this.logger.log(`Email dispatched to ${to} (Subject: "${subject}")`);
        return true;
      } catch (error) {
        this.logger.error(
          `Gmail OAuth2 dispatch failed to ${to}: ${error.message}`,
        );
        return false;
      }
    }

    // ─── ORIGINAL RESEND SEND (commented out for reference) ─────────────
    // if (this.resend) {
    //   const { error } = await this.resend.emails.send({
    //     from,
    //     to,
    //     subject,
    //     text,
    //     html,
    //     attachments,
    //   });
    //
    //   if (error) {
    //     this.logger.error(
    //       `Failed to dispatch email to ${to} via Resend: ${error.name} - ${error.message}`,
    //     );
    //     return false;
    //   }
    //
    //   this.logger.log(
    //     `Email successfully dispatched to ${to} (Subject: "${subject}").`,
    //   );
    //   return true;
    // }

    // ─── MOCK FALLBACK (no transport configured) ────────────────────────
    this.logger.log(`[MOCK EMAIL DISPATCH] To: ${to} | Subject: ${subject}`);
    return true;
  }
}
