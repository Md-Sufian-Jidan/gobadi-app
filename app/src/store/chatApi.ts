import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export interface ChatMessage {
  id: number;
  conversationId: number;
  sender: 'user' | 'doctor';
  text: string;
  time: string;
  createdAt: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
}

export interface Conversation {
  id: number;
  doctorId: number;
  doctorUserId?: number | null;
  patientId: number;
  appointmentId?: number | null;
  lastMessageAt?: string | null;
  createdAt: string;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
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
  tagTypes: ['ChatMessage', 'Conversation'],
  endpoints: (builder) => ({
    getConversations: builder.query<Conversation[], void>({
      query: () => '/chat/conversations',
      providesTags: ['Conversation'],
    }),
    getMessages: builder.query<ChatMessage[], number | void>({
      query: (conversationId) =>
        conversationId ? `/chat/messages?conversationId=${conversationId}` : '/chat/messages',
      providesTags: ['ChatMessage'],
    }),
    sendMessage: builder.mutation<ChatMessage, { text: string; conversationId?: number }>({
      query: ({ text, conversationId }) => ({
        url: '/chat/message',
        method: 'POST',
        body: conversationId ? { text, conversationId } : { text },
      }),
      invalidatesTags: ['ChatMessage', 'Conversation'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApi;
