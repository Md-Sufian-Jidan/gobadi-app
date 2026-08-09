import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, PaymentStatus } from './transaction.entity';
import { PaymentIntentDto } from './dto/payment-intent.dto';
import { Order, OrderStatus } from '../orders/order.entity';
import {
  Appointment,
  AppointmentStatus,
} from '../appointments/appointment.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createIntent(
    userId: number,
    dto: PaymentIntentDto,
  ): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      userId,
      amount: dto.amount,
      orderId: dto.orderId,
      bookingId: dto.bookingId,
      provider: dto.provider || 'simulate',
      status: PaymentStatus.PENDING,
      auditTrail: [
        {
          status: PaymentStatus.PENDING,
          timestamp: new Date(),
          message: 'Payment intent created',
        },
      ],
    });

    const saved = await this.transactionRepository.save(transaction);

    saved.redirectUrl = `/payments/simulate-checkout?transactionId=${saved.id}`;
    saved.callbackUrl = `/payments/callback?transactionId=${saved.id}`;

    return this.transactionRepository.save(saved);
  }

  async verifyPayment(transactionId: string): Promise<Transaction> {
    const tx = await this.transactionRepository.findOneBy({
      id: transactionId,
    });
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }
    return tx;
  }

  async simulateSuccess(
    transactionId: string,
    gatewayTxId?: string,
  ): Promise<Transaction> {
    let notifyOrder: Order | null = null;
    let notifyBooking: Appointment | null = null;

    const savedTx = await this.transactionRepository.manager.transaction(
      async (manager) => {
        const txRepo = manager.getRepository(Transaction);
        const orderRepo = manager.getRepository(Order);
        const appointmentRepo = manager.getRepository(Appointment);

        const tx = await txRepo.findOneBy({ id: transactionId });
        if (!tx) {
          throw new NotFoundException('Transaction not found');
        }

        if (tx.status === PaymentStatus.SUCCESSFUL) {
          return tx;
        }

        tx.status = PaymentStatus.SUCCESSFUL;
        tx.gatewayTransactionId =
          gatewayTxId || `SIM-TX-${Math.floor(100000 + Math.random() * 900000)}`;
        tx.auditTrail.push({
          status: PaymentStatus.SUCCESSFUL,
          timestamp: new Date(),
          message: 'Payment succeeded via gateway simulator',
        });

        const saved = await txRepo.save(tx);

        if (tx.orderId) {
          const order = await orderRepo.findOneBy({ id: tx.orderId });
          if (order) {
            order.paymentStatus = 'successful';
            order.status = OrderStatus.CONFIRMED;
            order.transactionId = saved.gatewayTransactionId;
            notifyOrder = await orderRepo.save(order);
          }
        } else if (tx.bookingId) {
          const booking = await appointmentRepo.findOneBy({ id: tx.bookingId });
          if (booking) {
            booking.paymentStatus = 'PAID';
            booking.status = AppointmentStatus.CONFIRMED;
            booking.paymentTransactionId = saved.gatewayTransactionId;
            notifyBooking = await appointmentRepo.save(booking);
          }
        }

        return saved;
      },
    );

    if (notifyOrder) {
      const order: Order = notifyOrder;
      await this.notificationsService.createNotification(
        order.userId,
        'Payment received',
        `Payment received for order ${order.id}.`,
        NotificationType.PAYMENT,
        'Order',
        order.id,
      );
    }
    if (notifyBooking) {
      const booking: Appointment = notifyBooking;
      await this.notificationsService.createNotification(
        booking.patientId,
        'Payment confirmed',
        'Payment confirmed for your appointment.',
        NotificationType.PAYMENT,
        'Appointment',
        String(booking.id),
      );
    }

    return savedTx;
  }

  async simulateFail(transactionId: string): Promise<Transaction> {
    let notifyOrder: Order | null = null;
    let notifyBooking: Appointment | null = null;

    const savedTx = await this.transactionRepository.manager.transaction(
      async (manager) => {
        const txRepo = manager.getRepository(Transaction);
        const orderRepo = manager.getRepository(Order);
        const appointmentRepo = manager.getRepository(Appointment);

        const tx = await txRepo.findOneBy({ id: transactionId });
        if (!tx) {
          throw new NotFoundException('Transaction not found');
        }

        if (tx.status === PaymentStatus.FAILED) {
          return tx;
        }

        tx.status = PaymentStatus.FAILED;
        tx.auditTrail.push({
          status: PaymentStatus.FAILED,
          timestamp: new Date(),
          message: 'Payment failed via gateway simulator',
        });

        const saved = await txRepo.save(tx);

        if (tx.orderId) {
          const order = await orderRepo.findOneBy({ id: tx.orderId });
          if (order) {
            order.paymentStatus = 'failed';
            order.status = OrderStatus.FAILED;
            notifyOrder = await orderRepo.save(order);
          }
        } else if (tx.bookingId) {
          const booking = await appointmentRepo.findOneBy({ id: tx.bookingId });
          if (booking) {
            booking.paymentStatus = 'FAILED';
            booking.status = AppointmentStatus.CANCELLED;
            notifyBooking = await appointmentRepo.save(booking);
          }
        }

        return saved;
      },
    );

    if (notifyOrder) {
      const order: Order = notifyOrder;
      await this.notificationsService.createNotification(
        order.userId,
        'Payment failed',
        `Payment failed for order ${order.id}.`,
        NotificationType.PAYMENT,
        'Order',
        order.id,
      );
    }
    if (notifyBooking) {
      const booking: Appointment = notifyBooking;
      await this.notificationsService.createNotification(
        booking.patientId,
        'Payment failed',
        'Payment failed — your appointment was cancelled.',
        NotificationType.PAYMENT,
        'Appointment',
        String(booking.id),
      );
    }

    return savedTx;
  }
}
