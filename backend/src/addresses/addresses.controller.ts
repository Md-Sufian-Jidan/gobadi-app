import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './address.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: "Get list of current user's addresses" })
  @ApiResponse({ status: 200, description: 'List of addresses' })
  async findAll(@CurrentUser() user: JwtPayload): Promise<Address[]> {
    return this.addressesService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of an address by ID' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Address info' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<Address> {
    return this.addressesService.findOne(parseInt(id, 10), user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAddressDto,
  ): Promise<Address> {
    return this.addressesService.create(user.sub, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing address by ID' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Address updated' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAddressDto,
  ): Promise<Address> {
    return this.addressesService.update(parseInt(id, 10), user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address by ID' })
  @ApiParam({ name: 'id', example: '1' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.addressesService.remove(parseInt(id, 10), user.sub);
  }
}
