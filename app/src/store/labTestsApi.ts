import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface LabTest {
  id: number;
  animalId: number;
  testType: string;
  testName: string;
  result?: string;
  normalRange?: string;
  dateConducted?: string;
  orderedBy?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface CreateLabTestInput {
  animalId: number;
  testType: string;
  testName: string;
  result?: string;
  normalRange?: string;
  dateConducted?: string;
  orderedBy?: string;
  notes?: string;
}

export const labTestsApi = createApi({
  reducerPath: 'labTestsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['LabTest'],
  endpoints: (builder) => ({
    getByAnimal: builder.query<LabTest[], string>({
      query: (animalId) => `/lab-tests/animal/${animalId}`,
      providesTags: (_result, _error, animalId) => [{ type: 'LabTest', id: animalId }],
    }),
    create: builder.mutation<LabTest, CreateLabTestInput>({
      query: (body) => ({
        url: '/lab-tests',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { animalId }) => [
        { type: 'LabTest', id: animalId },
      ],
    }),
    update: builder.mutation<LabTest, { id: number; data: Partial<LabTest> }>({
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
  useGetByAnimalQuery,
  useCreateMutation,
  useUpdateMutation,
} = labTestsApi;
