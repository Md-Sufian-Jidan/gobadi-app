import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MarketRatesService } from './market-rates.service';
import { CreateMarketRateDto } from './dto/create-market-rate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { MarketRate } from './market-rate.entity';

@ApiTags('admin/market-rates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/market-rates')
export class AdminMarketRatesController {
  constructor(private readonly marketRatesService: MarketRatesService) {}

  @Post()
  @ApiOperation({ summary: 'Add or update a market rate' })
  @ApiResponse({ status: 201, description: 'Rate added/updated' })
  async createOrUpdate(
    @Body() dto: CreateMarketRateDto,
  ): Promise<MarketRate> {
    return this.marketRatesService.createOrUpdate(dto);
  }
}
