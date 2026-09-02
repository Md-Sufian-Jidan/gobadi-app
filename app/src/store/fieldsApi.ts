import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface Field {
  id: number;
  userId: number;
  name: string;
  sizeAcres: number;
  cropType?: string;
  location?: string;
  createdAt: string;
}

export interface CreateFieldInput {
  name: string;
  sizeAcres: number;
  cropType?: string;
  location?: string;
}

export const fieldsApi = createApi({
  reducerPath: 'fieldsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Field'],
  endpoints: (builder) => ({
    getFields: builder.query<Field[], void>({
      query: () => '/fields',
      providesTags: (result) =>
        result
          ? [...result.map((f) => ({ type: 'Field' as const, id: f.id })), { type: 'Field', id: 'LIST' }]
          : [{ type: 'Field', id: 'LIST' }],
    }),
    createField: builder.mutation<Field, CreateFieldInput>({
      query: (body) => ({
        url: '/fields',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Field', id: 'LIST' }],
    }),
    updateField: builder.mutation<Field, { id: number; data: Partial<Field> }>({
      query: ({ id, data }) => ({
        url: `/fields/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Field', id },
        { type: 'Field', id: 'LIST' },
      ],
    }),
    removeField: builder.mutation<void, number>({
      query: (id) => ({
        url: `/fields/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Field', id },
        { type: 'Field', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetFieldsQuery,
  useCreateFieldMutation,
  useUpdateFieldMutation,
  useRemoveFieldMutation,
} = fieldsApi;
