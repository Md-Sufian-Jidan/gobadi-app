import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface ChatMessage {
  id: number;
  conversationId: number;
  sender: 'user' | 'doctor';
  text: string;
  time: string;
  createdAt: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  attachmentUrl?: string | null;
  attachmentType?: 'image' | 'document' | null;
  attachmentMimeType?: string | null;
}

export interface SendAttachmentInput {
  conversationId?: number;
  caption?: string;
  file: { uri: string; name: string; type: string };
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
  baseQuery: baseQueryWithReauth,
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
    sendAttachmentMessage: builder.mutation<ChatMessage, SendAttachmentInput>({
      query: ({ conversationId, caption, file }) => {
        const formData = new FormData();
        // React Native's FormData accepts { uri, name, type } file objects directly.
        formData.append('file', file as unknown as Blob);
        if (conversationId) formData.append('conversationId', String(conversationId));
        if (caption) formData.append('caption', caption);
        return {
          url: '/chat/message/attachment',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['ChatMessage', 'Conversation'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useSendAttachmentMessageMutation,
} = chatApi;
