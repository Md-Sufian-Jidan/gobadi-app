import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export interface WeatherData {
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

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getWeather: builder.query<WeatherData, void>({
      query: () => '/weather',
    }),
  }),
});

export const { useGetWeatherQuery } = weatherApi;
