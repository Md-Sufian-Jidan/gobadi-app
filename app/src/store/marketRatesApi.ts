import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface MarketRate {
  id: number;
  commodity: string;
  unit: string;
  price: number;
  market: string;
  date: string;
  change: number;
  changePercent: number;
}

export const marketRatesApi = createApi({
  reducerPath: 'marketRatesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['MarketRate'],
  endpoints: (builder) => ({
    getLatestRates: builder.query<MarketRate[], void>({
      query: () => '/market-rates',
      providesTags: ['MarketRate'],
    }),
    getHistory: builder.query<MarketRate[], { commodity?: string }>({
      query: (params) => ({
        url: '/market-rates/history',
        params,
      }),
      providesTags: ['MarketRate'],
    }),
  }),
});

export const {
  useGetLatestRatesQuery,
  useGetHistoryQuery,
} = marketRatesApi;
