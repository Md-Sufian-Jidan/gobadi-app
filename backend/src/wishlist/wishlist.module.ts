import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistItem } from './wishlist-item.entity';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { ProductsModule } from '../products/products.module';
import { LivestockModule } from '../livestock/livestock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WishlistItem]),
    ProductsModule,
    LivestockModule,
  ],
  providers: [WishlistService],
  controllers: [WishlistController],
  exports: [WishlistService, TypeOrmModule],
})
export class WishlistModule {}
