import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Animal } from '../animals/animal.entity';
import { Doctor } from '../doctors/doctor.entity';
import { Availability } from '../doctors/availability.entity';
import { ChatMessage } from '../chat/chat-message.entity';
import { Conversation } from '../chat/conversation.entity';
import { User } from '../users/user.entity';

import { Category } from '../products/category.entity';
import { Brand } from '../products/brand.entity';
import { Product } from '../products/product.entity';
import { InventoryLedger } from '../products/inventory-ledger.entity';
import { Livestock } from '../livestock/livestock.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Service } from '../services/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Animal,
      Doctor,
      Availability,
      ChatMessage,
      Conversation,
      Category,
      Brand,
      Product,
      InventoryLedger,
      Livestock,
      Clinic,
      Service,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
