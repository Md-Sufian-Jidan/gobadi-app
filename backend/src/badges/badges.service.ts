import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Badge } from './badge.entity';
import { UserBadge } from './user-badge.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
  ) {}

  async getAvailableBadges(
    userId?: number,
  ): Promise<(Badge & { earned?: boolean; earnedAt?: Date })[]> {
    const badges = await this.badgeRepository.find();

    if (!userId) return badges;

    const userBadges = await this.userBadgeRepository.find({ where: { userId } });
    const earnedMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.earnedAt]));

    return badges.map((badge) => ({
      ...badge,
      earned: earnedMap.has(badge.id),
      earnedAt: earnedMap.get(badge.id),
    }));
  }

  async getMyBadges(userId: number): Promise<(Badge & { earnedAt: Date })[]> {
    const userBadges = await this.userBadgeRepository.find({
      where: { userId },
      order: { earnedAt: 'DESC' },
    });

    if (userBadges.length === 0) return [];

    const badgeIds = userBadges.map((ub) => ub.badgeId);
    const badges = await this.badgeRepository.findBy({ id: In(badgeIds) });
    const badgeMap = new Map(badges.map((b) => [b.id, b]));

    return userBadges
      .filter((ub) => badgeMap.has(ub.badgeId))
      .map((ub) => ({
        ...badgeMap.get(ub.badgeId)!,
        earnedAt: ub.earnedAt,
      }));
  }

  async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
    const existing = await this.userBadgeRepository.findOneBy({
      userId,
      badgeId,
    });
    if (existing) return existing;

    return this.userBadgeRepository.save(
      this.userBadgeRepository.create({ userId, badgeId }),
    );
  }
}
