import { WeatherDataDto } from './dto/weather-data.dto';

export const WEATHER_PROVIDER = 'WEATHER_PROVIDER';

export interface IWeatherProvider {
  fetchWeatherData(
    lat: number,
    long: number,
    district?: string,
  ): Promise<WeatherDataDto>;
}
