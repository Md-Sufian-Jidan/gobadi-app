import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MedicalRecordsService } from './medical-records.service';
import { ChatGateway } from '../chat/chat.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Processor('file-processing-queue')
export class FileProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(FileProcessingProcessor.name);

  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly chatGateway: ChatGateway,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name !== 'process-attachment') {
      return;
    }

    const { attachmentId, mimeType } = job.data;
    this.logger.log(`Processing attachment ${attachmentId} (job ${job.id})...`);

    await this.medicalRecordsService.markProcessing(attachmentId);

    // Simulate virus scanning / document parsing latency
    await sleep(3000 + Math.random() * 4000);

    const attachment = await this.medicalRecordsService.findById(attachmentId);

    if (!this.medicalRecordsService.isMimeTypeAllowed(mimeType)) {
      await this.medicalRecordsService.markFailed(
        attachmentId,
        `Unsupported file type: ${mimeType}`,
      );
      this.chatGateway.notifyUser(
        attachment.uploadedByUserId,
        'attachmentStatusUpdate',
        {
          id: attachmentId,
          status: 'FAILED',
        },
      );
      await this.notificationsService.createNotification(
        attachment.uploadedByUserId,
        'Document processing failed',
        "We couldn't process your uploaded document.",
        NotificationType.SYSTEM,
        'Attachment',
        String(attachmentId),
      );
      return { success: false, attachmentId };
    }

    await this.medicalRecordsService.markReady(attachmentId);
    this.chatGateway.notifyUser(
      attachment.uploadedByUserId,
      'attachmentStatusUpdate',
      {
        id: attachmentId,
        status: 'READY',
      },
    );
    await this.notificationsService.createNotification(
      attachment.uploadedByUserId,
      'Document ready',
      'Your document is ready to view.',
      NotificationType.PRESCRIPTION_READY,
      'Attachment',
      String(attachmentId),
    );

    return { success: true, attachmentId };
  }
}
