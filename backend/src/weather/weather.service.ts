import { Inject, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { WeatherDataDto } from './dto/weather-data.dto';
import { WEATHER_PROVIDER } from './weather-provider.interface';
import type { IWeatherProvider } from './weather-provider.interface';
import { MockWeatherProvider } from './providers/mock-weather.provider';
import { CircuitBreaker } from './circuit-breaker';

const CACHE_TTL_SECONDS = 20 * 60;
const DEFAULT_LAT = 23.55;
const DEFAULT_LONG = 90.53;

@Injectable()
export class WeatherService {
  private readonly breaker = new CircuitBreaker();

  constructor(
    @Inject(WEATHER_PROVIDER) private readonly primaryProvider: IWeatherProvider,
    private readonly fallbackProvider: MockWeatherProvider,
    private readonly redisService: RedisService,
  ) {}

  async getWeather(
    lat?: number,
    long?: number,
    district?: string,
  ): Promise<WeatherDataDto> {
    const resolvedLat = lat ?? DEFAULT_LAT;
    const resolvedLong = long ?? DEFAULT_LONG;
    const cacheKey = this.buildCacheKey(resolvedLat, resolvedLong);

    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return { ...JSON.parse(cached), isCached: true };
      }
    } catch (err) {
      console.warn('Failed to read weather cache from Redis', err);
    }

    const weather = await this.breaker.execute(
      () => this.primaryProvider.fetchWeatherData(resolvedLat, resolvedLong, district),
      () => this.fallbackProvider.fetchWeatherData(resolvedLat, resolvedLong, district),
    );

    try {
      await this.redisService.set(cacheKey, JSON.stringify(weather), CACHE_TTL_SECONDS);
    } catch (err) {
      console.warn('Failed to write weather cache to Redis', err);
    }

    return weather;
  }

  private buildCacheKey(lat: number, long: number): string {
    return `cache:weather:lat:${lat.toFixed(2)}:long:${long.toFixed(2)}`;
  }
}
