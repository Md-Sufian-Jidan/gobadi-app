import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isActive: boolean;
}

export interface MySubscription {
  id: string;
  planId: string;
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
    getPlans: builder.query<SubscriptionPlan[], void>({
      query: () => '/subscriptions/plans',
      providesTags: ['SubscriptionPlan'],
    }),
    getMySubscription: builder.query<MySubscription | null, void>({
      query: () => '/subscriptions/my',
      providesTags: ['Subscription'],
    }),
    subscribe: builder.mutation<any, { planId: string }>({
      query: (body) => ({
        url: '/subscriptions/subscribe',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription'],
    }),
    cancel: builder.mutation<any, void>({
      query: () => ({
        url: '/subscriptions/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
  useSubscribeMutation,
  useCancelMutation,
} = subscriptionsApi;
