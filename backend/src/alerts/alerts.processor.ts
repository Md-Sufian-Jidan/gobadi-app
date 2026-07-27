import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AlertsService } from './alerts.service';
import { ChatGateway } from '../chat/chat.gateway';

@Processor('alerts-queue')
export class AlertsProcessor extends WorkerHost {
  private readonly logger = new Logger(AlertsProcessor.name);

  constructor(
    private readonly alertsService: AlertsService,
    private readonly chatGateway: ChatGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'log-alert-action') {
      const { alertId, userId, actionChoice } = job.data;
      await this.alertsService.persistActionLog(alertId, userId, actionChoice);
      return { success: true };
    }

    if (job.name === 'broadcast-alert') {
      const { alert } = job.data;
      this.chatGateway.broadcastAll('alertBroadcast', alert);
      this.logger.log(`Broadcast alert ${alert.id} to connected users`);
      return { success: true };
    }
  }
}
