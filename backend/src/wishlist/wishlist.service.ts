import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './wishlist-item.entity';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';
import { ProductsService } from '../products/products.service';
import { LivestockService } from '../livestock/livestock.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepository: Repository<WishlistItem>,
    private readonly productsService: ProductsService,
    private readonly livestockService: LivestockService,
  ) {}

  async getWishlist(userId: number): Promise<WishlistItem[]> {
    return this.wishlistRepository.find({
      where: { userId },
      relations: { product: true, livestock: true },
      order: { createdAt: 'DESC' },
    });
  }

  async addItem(userId: number, dto: AddWishlistItemDto): Promise<WishlistItem> {
    const { productId, livestockId } = dto;

    if (productId && livestockId) {
      throw new BadRequestException('Cannot add both product and livestock to wishlist item');
    }
    if (!productId && !livestockId) {
      throw new BadRequestException('Must provide either productId or livestockId');
    }

    if (productId) {
      await this.productsService.findOne(productId);
      const existing = await this.wishlistRepository.findOneBy({ userId, productId });
      if (existing) return existing;

      const item = this.wishlistRepository.create({ userId, productId });
      return this.wishlistRepository.save(item);
    } else {
      await this.livestockService.findOne(livestockId!);
      const existing = await this.wishlistRepository.findOneBy({ userId, livestockId });
      if (existing) return existing;

      const item = this.wishlistRepository.create({ userId, livestockId });
      return this.wishlistRepository.save(item);
    }
  }

  async removeItem(id: number, userId: number): Promise<void> {
    const item = await this.wishlistRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }
    if (item.userId !== userId) {
      throw new ForbiddenException('You do not own this wishlist item');
    }
    await this.wishlistRepository.remove(item);
  }
}
