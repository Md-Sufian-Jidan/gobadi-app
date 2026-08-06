import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { WeatherDataDto } from './dto/weather-data.dto';
import { WeatherQueryDto } from './dto/weather-query.dto';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({ summary: 'Get current farm weather for a location' })
  @ApiResponse({ status: 200, description: 'Current weather snapshot' })
  async getWeather(@Query() query: WeatherQueryDto): Promise<WeatherDataDto> {
    return this.weatherService.getWeather(
      query.lat,
      query.long,
      query.district,
    );
  }
}
