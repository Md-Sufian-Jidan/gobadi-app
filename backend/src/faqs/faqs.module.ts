import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from './faq.entity';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { AdminFaqsController } from './admin-faqs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Faq])],
  controllers: [FaqsController, AdminFaqsController],
  providers: [FaqsService],
  exports: [FaqsService],
})
export class FaqsModule {}
