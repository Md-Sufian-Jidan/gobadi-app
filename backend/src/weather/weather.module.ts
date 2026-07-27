import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { OpenWeatherProvider } from './providers/openweather.provider';
import { MockWeatherProvider } from './providers/mock-weather.provider';
import { WEATHER_PROVIDER } from './weather-provider.interface';

@Module({
  controllers: [WeatherController],
  providers: [
    WeatherService,
    OpenWeatherProvider,
    MockWeatherProvider,
    { provide: WEATHER_PROVIDER, useExisting: OpenWeatherProvider },
  ],
  exports: [WeatherService],
})
export class WeatherModule {}
