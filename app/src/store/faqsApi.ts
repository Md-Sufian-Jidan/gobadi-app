import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  createdAt: string;
}

export const faqsApi = createApi({
  reducerPath: 'faqsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Faq'],
  endpoints: (builder) => ({
    getFaqs: builder.query<Faq[], { category?: string }>({
      query: (params) => ({
        url: '/faqs',
        params,
      }),
      providesTags: ['Faq'],
    }),
    getFaqById: builder.query<Faq, string>({
      query: (id) => `/faqs/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Faq', id }],
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useGetFaqByIdQuery,
} = faqsApi;
