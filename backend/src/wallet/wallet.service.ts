import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
import { WalletTransaction } from './wallet-transaction.entity';
import { PaginatedResult } from '../common/paginated-result.interface';
export { Wallet } from './wallet.entity';
export { WalletTransaction } from './wallet-transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async getOrCreateWallet(userId: number): Promise<Wallet> {
    let wallet = await this.walletRepository.findOneBy({ userId });
    if (!wallet) {
      wallet = await this.walletRepository.save(
        this.walletRepository.create({ userId, balance: 0, coins: 0 }),
      );
    }
    return wallet;
  }

  async getBalance(userId: number): Promise<{ balance: number; coins: number }> {
    const wallet = await this.getOrCreateWallet(userId);
    return { balance: wallet.balance, coins: wallet.coins };
  }

  async getTransactions(
    userId: number,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<WalletTransaction>> {
    const wallet = await this.getOrCreateWallet(userId);
    const currentPage = page && page > 0 ? page : 1;
    const pageSize = limit && limit > 0 ? limit : 20;
    const [data, total] = await this.walletTransactionRepository.findAndCount({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
    return { data, page: currentPage, limit: pageSize, total };
  }

  /**
   * Adjust a user's wallet balance and record the ledger entry in the same
   * transaction. `amount` is signed — negative deducts, positive credits.
   * Balances are allowed to go negative (this is an internal ledger, not a
   * custody account) so a doctor's forced-cancellation fee always succeeds.
   */
  async adjustBalance(
    userId: number,
    amount: number,
    reason: string,
    referenceType?: string,
    referenceId?: string,
  ): Promise<WalletTransaction> {
    return this.dataSource.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      let wallet = await walletRepo
        .createQueryBuilder('w')
        .setLock('pessimistic_write')
        .where('w.userId = :userId', { userId })
        .getOne();
      if (!wallet) {
        wallet = await walletRepo.save(
          walletRepo.create({ userId, balance: 0, coins: 0 }),
        );
      }

      wallet.balance += amount;
      await walletRepo.save(wallet);

      return manager.getRepository(WalletTransaction).save(
        manager.getRepository(WalletTransaction).create({
          walletId: wallet.id,
          amount,
          reason,
          referenceType,
          referenceId,
        }),
      );
    });
  }

  /**
   * Top up wallet balance. Returns new balance.
   */
  async topUp(
    userId: number,
    amount: number,
    method: string,
  ): Promise<{ balance: number; coins: number }> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    await this.adjustBalance(userId, amount, `topup_${method}`);
    return this.getBalance(userId);
  }

  /**
   * Pay from wallet balance. Deducts amount and returns new balance.
   * Throws if insufficient balance.
   */
  async pay(
    userId: number,
    amount: number,
    reason: string,
    referenceType?: string,
    referenceId?: string,
  ): Promise<{ balance: number; coins: number }> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    const wallet = await this.getOrCreateWallet(userId);
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }
    await this.adjustBalance(userId, -amount, reason, referenceType, referenceId);
    return this.getBalance(userId);
  }

  /**
   * Earn coins. Adds coins to wallet.
   */
  async earnCoins(
    userId: number,
    amount: number,
    reason: string,
  ): Promise<{ balance: number; coins: number }> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    return this.dataSource.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      let wallet = await walletRepo
        .createQueryBuilder('w')
        .setLock('pessimistic_write')
        .where('w.userId = :userId', { userId })
        .getOne();
      if (!wallet) {
        wallet = await walletRepo.save(
          walletRepo.create({ userId, balance: 0, coins: 0 }),
        );
      }

      wallet.coins += amount;
      await walletRepo.save(wallet);

      await manager.getRepository(WalletTransaction).save(
        manager.getRepository(WalletTransaction).create({
          walletId: wallet.id,
          amount: 0,
          reason: `coins_earn: ${reason}`,
          referenceType: 'coins',
        }),
      );

      return { balance: wallet.balance, coins: wallet.coins };
    });
  }

  /**
   * Spend coins. Deducts coins from wallet.
   * Throws if insufficient coins.
   */
  async spendCoins(
    userId: number,
    amount: number,
    reason: string,
  ): Promise<{ balance: number; coins: number }> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    return this.dataSource.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      let wallet = await walletRepo
        .createQueryBuilder('w')
        .setLock('pessimistic_write')
        .where('w.userId = :userId', { userId })
        .getOne();
      if (!wallet) {
        wallet = await walletRepo.save(
          walletRepo.create({ userId, balance: 0, coins: 0 }),
        );
      }

      if (wallet.coins < amount) {
        throw new BadRequestException('Insufficient coins');
      }

      wallet.coins -= amount;
      await walletRepo.save(wallet);

      await manager.getRepository(WalletTransaction).save(
        manager.getRepository(WalletTransaction).create({
          walletId: wallet.id,
          amount: 0,
          reason: `coins_spend: ${reason}`,
          referenceType: 'coins',
        }),
      );

      return { balance: wallet.balance, coins: wallet.coins };
    });
  }
}
