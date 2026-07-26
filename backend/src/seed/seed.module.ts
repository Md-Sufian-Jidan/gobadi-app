import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Animal } from '../animals/animal.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Availability } from '../doctors/availability.entity';
import { MarketItem } from '../marketplace/market-item.entity';
import { ChatMessage } from '../chat/chat-message.entity';
import { Conversation } from '../chat/conversation.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Animal,
      Doctor,
      Availability,
      MarketItem,
      ChatMessage,
      Conversation,
      User,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
