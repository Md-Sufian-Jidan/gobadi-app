import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

  @Post('analyze')
  @ApiOperation({ summary: 'Submit symptoms and photos for simulated AI diagnosis' })
  @ApiResponse({ status: 201, description: 'Diagnosis created' })
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
}
