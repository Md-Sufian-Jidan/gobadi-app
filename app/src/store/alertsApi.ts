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
  tagTypes: ['Alert'],
  endpoints: (builder) => ({
    getAlerts: builder.query<AlertItem[], void>({
      query: () => '/alerts',
      providesTags: (result) =>
        result
          ? [...result.map((a) => ({ type: 'Alert' as const, id: a.id })), { type: 'Alert', id: 'LIST' }]
          : [{ type: 'Alert', id: 'LIST' }],
    }),
    actOnAlert: builder.mutation<{ success: boolean }, { id: number; actionChoice: 'MANAGE' | 'SCHEDULE' }>({
      query: ({ id, actionChoice }) => ({
        url: `/alerts/${id}/action`,
        method: 'POST',
        body: { actionChoice },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Alert', id }, { type: 'Alert', id: 'LIST' }],
    }),
  }),
});

export const { useGetAlertsQuery, useActOnAlertMutation } = alertsApi;
