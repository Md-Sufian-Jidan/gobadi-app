import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('order-queue')
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing order job ${job.id} of type ${job.name}...`);

    if (job.name === 'process-checkout') {
      const { orderId, totalPrice, deliveryAddress, items } = job.data;
      this.logger.log(`[Order Async Processor] Order ID: ${orderId}`);
      this.logger.log(`[Order Async Processor] Total: BDT ${totalPrice}`);
      this.logger.log(
        `[Order Async Processor] Destination: ${deliveryAddress}`,
      );
      this.logger.log(`[Order Async Processor] Items count: ${items?.length}`);

      // Simulate asynchronous background invoice generation or SMS alert dispatch
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.logger.log(
        `[Order Async Processor] Order ${orderId} successfully processed in background!`,
      );
      return { success: true, orderId };
    }
  }
}
