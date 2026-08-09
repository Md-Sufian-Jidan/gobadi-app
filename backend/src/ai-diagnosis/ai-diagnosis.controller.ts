import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { CreateAiDiagnosisDto } from './dto/create-ai-diagnosis.dto';
import { AiDiagnosis } from './ai-diagnosis.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@ApiTags('ai-diagnosis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-diagnosis')
export class AiDiagnosisController {
  constructor(private readonly aiDiagnosisService: AiDiagnosisService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload a photo for AI diagnosis and get back its URL' })
  @ApiResponse({ status: 201, description: 'Image uploaded' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('A file is required');
    }
    const url = await this.aiDiagnosisService.uploadImage(file);
    return { url };
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Submit symptoms and photos for AI diagnosis (processed asynchronously)' })
  @ApiResponse({ status: 201, description: 'Diagnosis queued, returned with status PENDING' })
  async analyze(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAiDiagnosisDto,
  ): Promise<AiDiagnosis> {
    return this.aiDiagnosisService.analyze(user.sub, dto);
  }

  @Get('history')
  @ApiOperation({ summary: "Get current user's diagnostic check logs history" })
  @ApiResponse({ status: 200, description: 'List of diagnosis reports' })
  async getHistory(@CurrentUser() user: JwtPayload): Promise<AiDiagnosis[]> {
    return this.aiDiagnosisService.getHistory(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Poll a diagnosis by id for status/result' })
  @ApiParam({ name: 'id', example: '1' })
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AiDiagnosis> {
    return this.aiDiagnosisService.getById(parseInt(id, 10), user.sub);
  }
}
