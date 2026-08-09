import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { IPushProvider, PushMessage } from '../push-provider.interface';

@Injectable()
export class ExpoPushProvider implements IPushProvider {
  private readonly logger = new Logger(ExpoPushProvider.name);
  private readonly expo = new Expo();

  async sendPush(messages: PushMessage[]): Promise<string[]> {
    const validMessages = messages.filter((m) => {
      if (!Expo.isExpoPushToken(m.token)) {
        this.logger.warn(`Skipping non-Expo push token: ${m.token}`);
        return false;
      }
      return true;
    });
    if (validMessages.length === 0) {
      return [];
    }

    const expoMessages: ExpoPushMessage[] = validMessages.map((m) => ({
      to: m.token,
      title: m.title,
      body: m.body,
      data: m.data,
      sound: 'default',
    }));

    const staleTokens: string[] = [];
    const chunks = this.expo.chunkPushNotifications(expoMessages);
    for (const chunk of chunks) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.forEach((ticket, i) => {
          if (
            ticket.status === 'error' &&
            ticket.details?.error === 'DeviceNotRegistered'
          ) {
            const message = chunk[i];
            staleTokens.push(
              Array.isArray(message.to) ? message.to[0] : message.to,
            );
          } else if (ticket.status === 'error') {
            this.logger.warn(`Push ticket error: ${ticket.message}`);
          }
        });
      } catch (err) {
        this.logger.error('Failed to send Expo push notification chunk', err);
      }
    }

    return staleTokens;
  }
}
