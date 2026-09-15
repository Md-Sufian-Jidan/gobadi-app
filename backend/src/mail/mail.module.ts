import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';
import { EmailClientService } from './email-client.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail-queue',
    }),
  ],
  providers: [MailService, MailProcessor, EmailClientService],
  exports: [MailService, EmailClientService, BullModule],
})
export class MailModule {}
