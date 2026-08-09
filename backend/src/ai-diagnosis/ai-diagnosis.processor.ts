import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { AiDiagnosisAnalyzerService } from './ai-diagnosis-analyzer.service';
import { ChatGateway } from '../chat/chat.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

interface AnalyzeDiagnosisJobData {
  diagnosisId: number;
  userId: number;
  images: string[];
  symptoms: string[];
}

@Processor('ai-diagnosis-queue')
export class AiDiagnosisProcessor extends WorkerHost {
  private readonly logger = new Logger(AiDiagnosisProcessor.name);

  constructor(
    private readonly aiDiagnosisService: AiDiagnosisService,
    private readonly analyzerService: AiDiagnosisAnalyzerService,
    private readonly chatGateway: ChatGateway,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name !== 'analyze-diagnosis') {
      return;
    }

    const { diagnosisId, userId, images, symptoms } =
      job.data as AnalyzeDiagnosisJobData;
    this.logger.log(`Analyzing AI diagnosis ${diagnosisId} (job ${job.id})...`);

    try {
      const result = await this.analyzerService.diagnose(images, symptoms);
      await this.aiDiagnosisService.applyResult(diagnosisId, result);

      this.chatGateway.notifyUser(userId, 'aiDiagnosisStatusUpdate', {
        id: diagnosisId,
        status: 'READY',
      });
      await this.notificationsService.createNotification(
        userId,
        'AI diagnosis ready',
        `Your AI diagnosis is ready: ${result.analysisResult}.`,
        NotificationType.AI_READY,
        'AiDiagnosis',
        String(diagnosisId),
      );

      return { success: true, diagnosisId };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`AI diagnosis ${diagnosisId} failed`, err);
      await this.aiDiagnosisService.markFailed(diagnosisId, message);

      this.chatGateway.notifyUser(userId, 'aiDiagnosisStatusUpdate', {
        id: diagnosisId,
        status: 'FAILED',
      });
      await this.notificationsService.createNotification(
        userId,
        'AI diagnosis failed',
        'We could not complete your AI diagnosis. Please try again.',
        NotificationType.SYSTEM,
        'AiDiagnosis',
        String(diagnosisId),
      );

      return { success: false, diagnosisId };
    }
  }
}
