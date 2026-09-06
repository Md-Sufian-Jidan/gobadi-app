import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export interface JoinSessionResponse {
  token: string;
  channelName: string;
  appId: string;
}

export interface CreateSessionResponse {
  sessionId: number;
  channelName: string;
}

export const videoCallApi = createApi({
  reducerPath: 'videoCallApi',
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
  tagTypes: ['VideoSession'],
  endpoints: (builder) => ({
    createSession: builder.mutation<CreateSessionResponse, number>({
      query: (appointmentId) => ({
        url: '/video-call/create',
        method: 'POST',
        body: { appointmentId },
      }),
    }),
    joinSession: builder.query<JoinSessionResponse, number>({
      query: (appointmentId) => `/video-call/join/${appointmentId}`,
    }),
    endSession: builder.mutation<void, number>({
      query: (appointmentId) => ({
        url: `/video-call/end/${appointmentId}`,
        method: 'POST',
      }),
    }),
    getToken: builder.query<JoinSessionResponse, number>({
      query: (appointmentId) => `/video-call/token/${appointmentId}`,
    }),
  }),
});

export const {
  useCreateSessionMutation,
  useJoinSessionQuery,
  useEndSessionMutation,
  useGetTokenQuery,
} = videoCallApi;
