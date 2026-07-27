import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review, ReviewTargetType } from './review.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a new review (Validates purchase/booking verified flags)' })
  @ApiResponse({ status: 201, description: 'Review submitted' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.create(user.sub, dto);
  }

  @Get(':targetType/:targetId')
  @ApiOperation({ summary: 'List approved reviews for a specific target' })
  @ApiParam({ name: 'targetType', enum: ReviewTargetType })
  @ApiParam({ name: 'targetId', example: '1' })
  async findByTarget(
    @Param('targetType') targetType: ReviewTargetType,
    @Param('targetId') targetId: string,
  ): Promise<Review[]> {
    return this.reviewsService.findByTarget(targetType, targetId);
  }

  @Post(':id/helpful')
  @ApiOperation({ summary: 'Upvote a review helpfulness count' })
  @ApiParam({ name: 'id', example: '1' })
  async voteHelpful(@Param('id') id: string): Promise<Review> {
    return this.reviewsService.voteHelpful(parseInt(id, 10));
  }

  @Post(':id/report')
  @ApiOperation({ summary: 'Report a review as spam or inappropriate' })
  @ApiParam({ name: 'id', example: '1' })
  async reportReview(@Param('id') id: string): Promise<Review> {
    return this.reviewsService.reportReview(parseInt(id, 10));
  }

  @Get('reported')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all flagged/reported reviews (Admin only)' })
  async getReportedReviews(): Promise<Review[]> {
    return this.reviewsService.getReportedReviews();
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or Reject a review from publication (Admin only)' })
  @ApiParam({ name: 'id', example: '1' })
  async moderate(
    @Param('id') id: string,
    @Body() body: { isApproved: boolean },
  ): Promise<Review> {
    return this.reviewsService.moderate(parseInt(id, 10), body.isApproved);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a reply response to a review' })
  @ApiParam({ name: 'id', example: '1' })
  async reply(
    @Param('id') id: string,
    @Body() body: { replyText: string },
  ): Promise<Review> {
    return this.reviewsService.reply(parseInt(id, 10), body.replyText);
  }
}
