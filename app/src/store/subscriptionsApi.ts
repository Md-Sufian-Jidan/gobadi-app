import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isActive: boolean;
}

export interface MySubscription {
  id: number;
  planId: number;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export const subscriptionsApi = createApi({
  reducerPath: 'subscriptionsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Subscription', 'SubscriptionPlan'],
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
      query: () => '/subscriptions/plans',
      providesTags: ['SubscriptionPlan'],
    }),
    getMySubscription: builder.query<MySubscription | null, void>({
      query: () => '/subscriptions/my',
      providesTags: ['Subscription'],
    }),
    subscribe: builder.mutation<any, { planId: number; paymentMethodId: number }>({
      query: (body) => ({
        url: '/subscriptions/subscribe',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription'],
    }),
    cancelSubscription: builder.mutation<any, void>({
      query: () => ({
        url: '/subscriptions/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetMySubscriptionQuery,
  useSubscribeMutation,
  useCancelSubscriptionMutation,
} = subscriptionsApi;
