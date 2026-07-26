import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

const SCAN_INTERVAL_MS = 5 * 60 * 1000;

@Injectable()
export class RemindersService implements OnModuleInit {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectQueue('reminders-queue')
    private readonly remindersQueue: Queue,
  ) {}

  async onModuleInit() {
    // Stable jobId makes re-registration on every app restart a no-op if the schedule is unchanged.
    await this.remindersQueue.add(
      'scan-appointments',
      {},
      {
        repeat: { every: SCAN_INTERVAL_MS },
        jobId: 'appointment-reminder-scan',
      },
    );
    this.logger.log(
      `Registered repeatable appointment-reminder scan every ${SCAN_INTERVAL_MS / 1000}s`,
    );
  }
}
