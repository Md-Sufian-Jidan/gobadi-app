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
import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { Field } from './field.entity';

@ApiTags('fields')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Get()
  @ApiOperation({ summary: "List user's fields" })
  async list(@CurrentUser() user: JwtPayload): Promise<Field[]> {
    return this.fieldsService.list(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a field' })
  @ApiResponse({ status: 201, description: 'Field created' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateFieldDto,
  ): Promise<Field> {
    return this.fieldsService.create(user.sub, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a field (owner-only)' })
  @ApiParam({ name: 'id', example: '1' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: Partial<CreateFieldDto>,
  ): Promise<Field> {
    return this.fieldsService.update(parseInt(id, 10), user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a field (owner-only)' })
  @ApiParam({ name: 'id', example: '1' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ success: boolean }> {
    await this.fieldsService.remove(parseInt(id, 10), user.sub);
    return { success: true };
  }
}
