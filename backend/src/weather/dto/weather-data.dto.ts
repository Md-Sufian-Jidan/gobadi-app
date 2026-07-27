export class WeatherDataDto {
  location: string;
  temperature: number;
  highTemp: number;
  lowTemp: number;
  humidityPercentage: number;
  precipitationMl: number;
  pressureHpa: number;
  windMps: number;
  sunriseTime: string;
  sunsetTime: string;
  isCached: boolean;
}
