import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { WeatherDataDto } from './dto/weather-data.dto';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({ summary: 'Get current farm weather for a location' })
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'long', required: false })
  @ApiQuery({ name: 'district', required: false })
  @ApiResponse({ status: 200, description: 'Current weather snapshot' })
  async getWeather(
    @Query('lat') lat?: string,
    @Query('long') long?: string,
    @Query('district') district?: string,
  ): Promise<WeatherDataDto> {
    return this.weatherService.getWeather(
      lat ? parseFloat(lat) : undefined,
      long ? parseFloat(long) : undefined,
      district,
    );
  }
}
