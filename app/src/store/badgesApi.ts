import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: string;
}

export interface MyBadge {
  id: number;
  badgeId: number;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export const badgesApi = createApi({
  reducerPath: 'badgesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Badge'],
  endpoints: (builder) => ({
    getAvailableBadges: builder.query<Badge[], void>({
      query: () => '/badges/available',
      providesTags: ['Badge'],
    }),
    getMyBadges: builder.query<MyBadge[], void>({
      query: () => '/badges/me',
      providesTags: ['Badge'],
    }),
  }),
});

export const {
  useGetAvailableBadgesQuery,
  useGetMyBadgesQuery,
} = badgesApi;
