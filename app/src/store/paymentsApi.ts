import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';
import { ordersApi } from './ordersApi';
import { doctorPortalApi } from './doctorPortalApi';

export interface PaymentIntentResponse {
  transactionId: string;
  amount: number;
  status: string;
  provider: string;
  redirectUrl?: string;
  callbackUrl?: string;
}

export const paymentsApi = createApi({
  reducerPath: 'paymentsApi',
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
    createPaymentIntent: builder.mutation<
      PaymentIntentResponse,
      { orderId?: string; bookingId?: number; provider: string }
    >({
      query: (body) => ({
        url: '/payments/intent',
        method: 'POST',
        body,
      }),
    }),
    simulateSuccess: builder.mutation<any, string>({
      query: (transactionId) => ({
        url: '/payments/simulate-success',
        method: 'POST',
        body: { transactionId },
      }),
      async onQueryStarted(_transactionId, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        // Cross-slice invalidation: a payment status change makes cached orders/bookings stale.
        dispatch(ordersApi.util.invalidateTags(['Order']));
        dispatch(doctorPortalApi.util.invalidateTags(['DoctorBookings']));
      },
    }),
    simulateFailure: builder.mutation<any, string>({
      query: (transactionId) => ({
        url: '/payments/simulate-fail',
        method: 'POST',
        body: { transactionId },
      }),
      async onQueryStarted(_transactionId, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(ordersApi.util.invalidateTags(['Order']));
        dispatch(doctorPortalApi.util.invalidateTags(['DoctorBookings']));
      },
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useSimulateSuccessMutation,
  useSimulateFailureMutation,
} = paymentsApi;
