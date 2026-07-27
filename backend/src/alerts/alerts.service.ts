import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { ILike, Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { Alert } from './alert.entity';
import { AlertActionLog } from './alert-action-log.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { AlertActionType } from './alert.entity';
export { Alert } from './alert.entity';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(AlertActionLog)
    private readonly alertActionLogRepository: Repository<AlertActionLog>,
    @InjectQueue('alerts-queue')
    private readonly alertsQueue: Queue,
  ) {}

  async getActiveAlerts(): Promise<Alert[]> {
    return this.alertRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async search(q: string): Promise<Alert[]> {
    if (!q) {
      return [];
    }
    return this.alertRepository.find({
      where: [
        { title: ILike(`%${q}%`), isActive: true },
        { crop: ILike(`%${q}%`), isActive: true },
        { location: ILike(`%${q}%`), isActive: true },
      ],
      take: 10,
    });
  }

  async recordAction(
    alertId: number,
    userId: number,
    actionChoice: AlertActionType,
  ): Promise<{ success: boolean }> {
    const alert = await this.alertRepository.findOneBy({ id: alertId });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    try {
      await this.alertsQueue.add('log-alert-action', {
        alertId,
        userId,
        actionChoice,
      });
    } catch (err) {
      console.warn('Failed to enqueue alert action job', err);
    }

    return { success: true };
  }

  async persistActionLog(
    alertId: number,
    userId: number,
    actionChoice: AlertActionType,
  ): Promise<AlertActionLog> {
    const log = this.alertActionLogRepository.create({
      alertId,
      userId,
      actionChoice,
    });
    return this.alertActionLogRepository.save(log);
  }

  async createAlert(dto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create({ ...dto, isActive: true });
    const saved = await this.alertRepository.save(alert);

    try {
      await this.alertsQueue.add('broadcast-alert', { alert: saved });
    } catch (err) {
      console.warn('Failed to enqueue alert broadcast job', err);
    }

    return saved;
  }

  async deactivateAlert(id: number): Promise<void> {
    const alert = await this.alertRepository.findOneBy({ id });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    alert.isActive = false;
    await this.alertRepository.save(alert);
  }
}
