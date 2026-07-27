import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export interface Service {
  id: number;
  providerType: string;
  providerId: number;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  preparationInstructions?: string;
  requirements?: string;
  isOnline: boolean;
  isOffline: boolean;
  location?: string;
  isActive: boolean;
}

export const servicesApi = createApi({
  reducerPath: 'servicesApi',
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
    getServices: builder.query<Service[], { providerType?: string; providerId?: number }>({
      query: (params) => ({
        url: '/services',
        params,
      }),
    }),
    getService: builder.query<Service, number>({
      query: (id) => `/services/${id}`,
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
} = servicesApi;
