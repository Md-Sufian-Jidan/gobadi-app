import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from './mail.service';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing email job ${job.id} of type ${job.name}...`);

    if (job.name === 'send-otp') {
      const { email, otp } = job.data;
      const subject = 'Your Gobadi Verification OTP Code';
      const text = `Hello,\n\nYour Gobadi verification OTP is: ${otp}.\nThis code is valid for 5 minutes.\n\nBest regards,\nGobadi App Team`;
      const html = `<p>Hello,</p><p>Your Gobadi verification OTP is: <strong>${otp}</strong>.</p><p>This code is valid for 5 minutes.</p><p>Best regards,<br>Gobadi App Team</p>`;

      await this.mailService.sendMail(email, subject, text, html);
      return { success: true, email };
    }

    if (job.name === 'send-booking-confirmation') {
      const { email, doctorName, date, time } = job.data;
      const subject = 'Gobadi Booking Confirmation';
      const text = `Hello,\n\nYour appointment with ${doctorName} has been successfully scheduled for:\nDate: ${date}\nTime: ${time}.\n\nThank you for choosing Gobadi!\n\nBest regards,\nGobadi App Team`;
      const html = `<p>Hello,</p><p>Your appointment with <strong>${doctorName}</strong> has been successfully scheduled for:</p><ul><li><strong>Date:</strong> ${date}</li><li><strong>Time:</strong> ${time}</li></ul><p>Thank you for choosing Gobadi!</p><p>Best regards,<br>Gobadi App Team</p>`;

      await this.mailService.sendMail(email, subject, text, html);
      return { success: true, email };
    }

    if (job.name === 'send-appointment-reminder') {
      const { email, doctorName, date, time, windowLabel } = job.data;
      const subject = `Gobadi Appointment Reminder (${windowLabel})`;
      const text = `Hello,\n\nThis is a reminder that your appointment with ${doctorName} is coming up:\nDate: ${date}\nTime: ${time}.\n\nBest regards,\nGobadi App Team`;
      const html = `<p>Hello,</p><p>This is a reminder that your appointment with <strong>${doctorName}</strong> is coming up:</p><ul><li><strong>Date:</strong> ${date}</li><li><strong>Time:</strong> ${time}</li></ul><p>Best regards,<br>Gobadi App Team</p>`;

      await this.mailService.sendMail(email, subject, text, html);
      return { success: true, email };
    }

    if (job.name === 'send-payment-confirmation') {
      const { email, orderId, totalPrice, transactionId } = job.data;
      const subject = `Gobadi Order Payment Confirmed - ${orderId}`;
      const text = `Hello,\n\nPayment for your order ${orderId} has been successfully verified!\nAmount: BDT ${totalPrice}\nTransaction ID: ${transactionId}.\n\nThank you for shopping on Gobadi!\n\nBest regards,\nGobadi App Team`;
      const html = `<p>Hello,</p><p>Payment for your order <strong>${orderId}</strong> has been successfully verified!</p><ul><li><strong>Amount:</strong> BDT ${totalPrice}</li><li><strong>Transaction ID:</strong> ${transactionId}</li></ul><p>Thank you for shopping on Gobadi!</p><p>Best regards,<br>Gobadi App Team</p>`;

      await this.mailService.sendMail(email, subject, text, html);
      return { success: true, email };
    }
  }
}
