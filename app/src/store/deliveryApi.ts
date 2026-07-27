import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export interface DeliveryLog {
  status: string;
  timestamp: string;
  message?: string;
  location?: string;
}

export interface Delivery {
  id: number;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  timeline: DeliveryLog[];
  createdAt: string;
  updatedAt: string;
}

export const deliveryApi = createApi({
  reducerPath: 'deliveryApi',
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
    trackDelivery: builder.query<Delivery, string>({
      query: (trackingNumber) => `/delivery/track/${trackingNumber}`,
    }),
    getDeliveryByOrderId: builder.query<Delivery, string>({
      query: (orderId) => `/delivery/order/${orderId}`,
    }),
  }),
});

export const {
  useTrackDeliveryQuery,
  useGetDeliveryByOrderIdQuery,
} = deliveryApi;
