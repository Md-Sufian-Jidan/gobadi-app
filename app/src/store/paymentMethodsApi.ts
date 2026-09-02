import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface PaymentMethod {
  id: number;
  userId: number;
  type: string;
  provider: string;
  maskedNumber: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface CreatePaymentMethodInput {
  type: string;
  maskedNumber: string;
  provider?: string;
}

export const paymentMethodsApi = createApi({
  reducerPath: 'paymentMethodsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PaymentMethod'],
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => '/payment-methods',
      providesTags: (result) =>
        result
          ? [...result.map((m) => ({ type: 'PaymentMethod' as const, id: m.id })), { type: 'PaymentMethod', id: 'LIST' }]
          : [{ type: 'PaymentMethod', id: 'LIST' }],
    }),
    createPaymentMethod: builder.mutation<PaymentMethod, CreatePaymentMethodInput>({
      query: (body) => ({
        url: '/payment-methods',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PaymentMethod', id: 'LIST' }],
    }),
    updatePaymentMethod: builder.mutation<PaymentMethod, { id: number; data: Partial<PaymentMethod> }>({
      query: ({ id, data }) => ({
        url: `/payment-methods/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PaymentMethod', id },
        { type: 'PaymentMethod', id: 'LIST' },
      ],
    }),
    removePaymentMethod: builder.mutation<void, number>({
      query: (id) => ({
        url: `/payment-methods/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'PaymentMethod', id },
        { type: 'PaymentMethod', id: 'LIST' },
      ],
    }),
    setDefaultPaymentMethod: builder.mutation<any, number>({
      query: (id) => ({
        url: `/payment-methods/${id}/default`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'PaymentMethod', id: 'LIST' }],
    }),
    verifyPaymentMethodOtp: builder.mutation<any, { id: number; code: string }>({
      query: ({ id, code }) => ({
        url: `/payment-methods/${id}/verify-otp`,
        method: 'POST',
        body: { code },
      }),
      invalidatesTags: [{ type: 'PaymentMethod', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useRemovePaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
  useVerifyPaymentMethodOtpMutation,
} = paymentMethodsApi;
