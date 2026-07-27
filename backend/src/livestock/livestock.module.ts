import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Livestock } from './livestock.entity';
import { LivestockService } from './livestock.service';
import { LivestockController } from './livestock.controller';
import { RedisModule } from '../redis/redis.module';
import { MeilisearchModule } from '../meilisearch/meilisearch.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Livestock]),
    RedisModule,
    MeilisearchModule,
  ],
  providers: [LivestockService],
  controllers: [LivestockController],
  exports: [LivestockService, TypeOrmModule],
})
export class LivestockModule {}
