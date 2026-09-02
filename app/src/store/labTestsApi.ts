import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface LabTest {
  id: number;
  appointmentId: number;
  animalId: number;
  data: Record<string, any>;
  createdAt: string;
}

export interface CreateLabTestInput {
  appointmentId: number;
  animalId: number;
  data: Record<string, any>;
}

export const labTestsApi = createApi({
  reducerPath: 'labTestsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['LabTest'],
  endpoints: (builder) => ({
    getByAnimalLabTests: builder.query<LabTest[], string>({
      query: (animalId) => `/lab-tests/animal/${animalId}`,
      providesTags: (_result, _error, animalId) => [{ type: 'LabTest', id: animalId }],
    }),
    createLabTest: builder.mutation<LabTest, CreateLabTestInput>({
      query: (body) => ({
        url: '/lab-tests',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { animalId }) => [
        { type: 'LabTest', id: animalId },
      ],
    }),
    updateLabTest: builder.mutation<LabTest, { id: number; data: Partial<LabTest> }>({
      query: ({ id, data }) => ({
        url: `/lab-tests/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LabTest'],
    }),
  }),
});

export const {
  useGetByAnimalLabTestsQuery,
  useCreateLabTestMutation,
  useUpdateLabTestMutation,
} = labTestsApi;
