import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export interface AlertItem {
  id: number;
  title: string;
  location: string;
  crop: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionType: 'MANAGE' | 'SCHEDULE';
  isActive: boolean;
}

export const alertsApi = createApi({
  reducerPath: 'alertsApi',
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
    getAlerts: builder.query<AlertItem[], void>({
      query: () => '/alerts',
    }),
    actOnAlert: builder.mutation<{ success: boolean }, { id: number; actionChoice: 'MANAGE' | 'SCHEDULE' }>({
      query: ({ id, actionChoice }) => ({
        url: `/alerts/${id}/action`,
        method: 'POST',
        body: { actionChoice },
      }),
    }),
  }),
});

export const { useGetAlertsQuery, useActOnAlertMutation } = alertsApi;
