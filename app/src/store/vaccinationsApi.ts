import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface Vaccination {
  id: number;
  animalId: number;
  vaccineName: string;
  dateGiven: string;
  nextDueDate?: string;
  doseNumber?: number;
  veterinarian?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateVaccinationInput {
  animalId: number;
  vaccineName: string;
  dateGiven: string;
  nextDueDate?: string;
  doseNumber?: number;
  veterinarian?: string;
  notes?: string;
}

export const vaccinationsApi = createApi({
  reducerPath: 'vaccinationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Vaccination'],
  endpoints: (builder) => ({
    getByAnimal: builder.query<Vaccination[], string>({
      query: (animalId) => `/vaccinations/animal/${animalId}`,
      providesTags: (_result, _error, animalId) => [{ type: 'Vaccination', id: animalId }],
    }),
    create: builder.mutation<Vaccination, CreateVaccinationInput>({
      query: (body) => ({
        url: '/vaccinations',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { animalId }) => [
        { type: 'Vaccination', id: animalId },
      ],
    }),
    update: builder.mutation<Vaccination, { id: number; data: Partial<Vaccination> }>({
      query: ({ id, data }) => ({
        url: `/vaccinations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Vaccination'],
    }),
    remove: builder.mutation<void, number>({
      query: (id) => ({
        url: `/vaccinations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vaccination'],
    }),
  }),
});

export const {
  useGetByAnimalQuery,
  useCreateMutation,
  useUpdateMutation,
  useRemoveMutation,
} = vaccinationsApi;
