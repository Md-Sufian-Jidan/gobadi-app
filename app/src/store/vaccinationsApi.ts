import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface Vaccination {
  id: number;
  appointmentId: number;
  animalId: number;
  data: Record<string, any>;
  createdAt: string;
}

export interface CreateVaccinationInput {
  appointmentId: number;
  animalId: number;
  data: Record<string, any>;
}

export const vaccinationsApi = createApi({
  reducerPath: 'vaccinationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Vaccination'],
  endpoints: (builder) => ({
    getByAnimalVaccinations: builder.query<Vaccination[], string>({
      query: (animalId) => `/vaccinations/animal/${animalId}`,
      providesTags: (_result, _error, animalId) => [{ type: 'Vaccination', id: animalId }],
    }),
    createVaccination: builder.mutation<Vaccination, CreateVaccinationInput>({
      query: (body) => ({
        url: '/vaccinations',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { animalId }) => [
        { type: 'Vaccination', id: animalId },
      ],
    }),
    updateVaccination: builder.mutation<Vaccination, { id: number; data: Partial<Vaccination> }>({
      query: ({ id, data }) => ({
        url: `/vaccinations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Vaccination'],
    }),
    removeVaccination: builder.mutation<void, number>({
      query: (id) => ({
        url: `/vaccinations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vaccination'],
    }),
  }),
});

export const {
  useGetByAnimalVaccinationsQuery,
  useCreateVaccinationMutation,
  useUpdateVaccinationMutation,
  useRemoveVaccinationMutation,
} = vaccinationsApi;
