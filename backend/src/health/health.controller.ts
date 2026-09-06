import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Check database connectivity' })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  @ApiResponse({ status: 503, description: 'Database is unreachable' })
  async getHealth() {
    let dbStatus = 'UP';

    try {
      await this.dataSource.query('SELECT 1');
    } catch (err) {
      dbStatus = 'DOWN';
      throw new ServiceUnavailableException({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        details: { database: { status: dbStatus } },
      });
    }

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      details: { database: { status: dbStatus } },
    };
  }
}
