import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReferralsService, Referral } from './referrals.service';
import { ClaimReferralDto } from './dto/claim-referral.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

const SHARE_BASE_URL =
  process.env.REFERRAL_SHARE_BASE_URL || 'https://gobadi.app/refer';

@ApiTags('referrals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('me')
  @ApiOperation({
    summary: "Get the current user's referral code and earnings",
  })
  @ApiResponse({ status: 200, description: 'Referral summary' })
  async getMine(
    @CurrentUser() user: JwtPayload,
  ): Promise<Referral & { shareLink: string }> {
    const referral = await this.referralsService.getOrCreateForUser(user.sub);
    return {
      ...referral,
      shareLink: `${SHARE_BASE_URL}?code=${referral.referralCode}`,
    };
  }

  @Post('claim')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: "Claim another user's referral code" })
  @ApiResponse({ status: 201, description: 'Referral claimed' })
  async claim(
    @Body() body: ClaimReferralDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Referral> {
    return this.referralsService.claim(user.sub, body.code);
  }
}
