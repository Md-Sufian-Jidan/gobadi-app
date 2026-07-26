import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check database and Redis connectivity' })
  @ApiResponse({ status: 200, description: 'System is healthy' })
  @ApiResponse({ status: 503, description: 'Database or Redis is unreachable' })
  async getHealth() {
    let dbStatus = 'UP';
    let redisStatus = 'UP';
    const errors: string[] = [];

    // Verify PostgreSQL connection status
    try {
      await this.dataSource.query('SELECT 1');
    } catch (err) {
      dbStatus = 'DOWN';
      errors.push(`Database connection query failed: ${err.message}`);
    }

    // Verify Redis cache status
    try {
      await this.redisService.set('health_check', 'ok', 5);
      const ping = await this.redisService.get('health_check');
      if (ping !== 'ok') {
        throw new Error('Redis cache read verification mismatch');
      }
      await this.redisService.del('health_check');
    } catch (err) {
      redisStatus = 'DOWN';
      errors.push(`Redis connection failed: ${err.message}`);
    }

    const response = {
      status: errors.length === 0 ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      details: {
        database: { status: dbStatus },
        redis: { status: redisStatus },
      },
    };

    if (errors.length > 0) {
      throw new ServiceUnavailableException(response);
    }

    return response;
  }
}
