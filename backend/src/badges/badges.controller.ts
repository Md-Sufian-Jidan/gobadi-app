import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { Badge } from './badge.entity';

@ApiTags('badges')
@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get('available')
  @ApiOperation({ summary: 'Get all badges (public)' })
  async getAvailableBadges(): Promise<Badge[]> {
    return this.badgesService.getAvailableBadges();
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user earned badges' })
  async getMyBadges(
    @CurrentUser() user: JwtPayload,
  ): Promise<(Badge & { earnedAt: Date })[]> {
    return this.badgesService.getMyBadges(user.sub);
  }
}
