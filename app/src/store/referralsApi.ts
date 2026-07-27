import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export interface ReferralInfo {
  referralCode: string;
  totalEarned: number;
  pendingAmount: number;
  referralCount: number;
  shareLink: string;
}

export const referralsApi = createApi({
  reducerPath: 'referralsApi',
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
  tagTypes: ['Referral'],
  endpoints: (builder) => ({
    getMyReferral: builder.query<ReferralInfo, void>({
      query: () => '/referrals/me',
      providesTags: ['Referral'],
    }),
    claimReferral: builder.mutation<ReferralInfo, string>({
      query: (code) => ({ url: '/referrals/claim', method: 'POST', body: { code } }),
      invalidatesTags: ['Referral'],
    }),
  }),
});

export const { useGetMyReferralQuery, useClaimReferralMutation } = referralsApi;
