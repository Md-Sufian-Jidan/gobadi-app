import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface WalletBalance {
  balance: number;
  coins: number;
  currency: string;
}

export interface WalletTransaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  coins: number;
  description: string;
  createdAt: string;
}

export const walletApi = createApi({
  reducerPath: 'walletApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Wallet', 'WalletTransaction'],
  endpoints: (builder) => ({
    getBalance: builder.query<WalletBalance, void>({
      query: () => '/wallet',
      providesTags: ['Wallet'],
    }),
    getTransactions: builder.query<WalletTransaction[], { page?: string; limit?: string }>({
      query: (params) => ({
        url: '/wallet/transactions',
        params,
      }),
      providesTags: ['WalletTransaction'],
    }),
    topUp: builder.mutation<any, { amount: number }>({
      query: (body) => ({
        url: '/wallet/topup',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'WalletTransaction'],
    }),
    pay: builder.mutation<any, { amount: number; description?: string }>({
      query: (body) => ({
        url: '/wallet/pay',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'WalletTransaction'],
    }),
    earnCoins: builder.mutation<any, { amount: number; reason?: string }>({
      query: (body) => ({
        url: '/wallet/earn-coins',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'WalletTransaction'],
    }),
    spendCoins: builder.mutation<any, { amount: number; reason?: string }>({
      query: (body) => ({
        url: '/wallet/spend-coins',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'WalletTransaction'],
    }),
  }),
});

export const {
  useGetBalanceQuery,
  useGetTransactionsQuery,
  useTopUpMutation,
  usePayMutation,
  useEarnCoinsMutation,
  useSpendCoinsMutation,
} = walletApi;
