import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { InventoryLedger } from './inventory-ledger.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { RedisModule } from '../redis/redis.module';
import { MeilisearchModule } from '../meilisearch/meilisearch.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Brand, InventoryLedger]),
    RedisModule,
    MeilisearchModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
