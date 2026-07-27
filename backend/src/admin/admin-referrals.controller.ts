import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReferralsService, Referral } from '../referrals/referrals.service';
import { ApproveReferralDto } from './dto/approve-referral.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/referrals')
export class AdminReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('pending')
  @ApiOperation({ summary: 'List referrals pending payout (admin only)' })
  @ApiResponse({ status: 200, description: 'List of pending referrals' })
  async getPending(): Promise<Referral[]> {
    return this.referralsService.findPending();
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a referral payout (admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 201, description: 'Payout approved' })
  async approve(
    @Param('id') id: string,
    @Body() body: ApproveReferralDto,
  ): Promise<Referral> {
    return this.referralsService.approvePayout(parseInt(id, 10), body.amount);
  }
}
