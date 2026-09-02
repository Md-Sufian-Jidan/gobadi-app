import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface Consultation {
  id: number;
  animalId: number;
  doctorId: number;
  appointmentId?: number;
  chiefComplaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  createdAt: string;
}

export const consultationsApi = createApi({
  reducerPath: 'consultationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Consultation'],
  endpoints: (builder) => ({
    getByAnimal: builder.query<Consultation[], string>({
      query: (animalId) => `/consultations/animal/${animalId}`,
      providesTags: (_result, _error, animalId) => [{ type: 'Consultation', id: animalId }],
    }),
    getById: builder.query<Consultation, string>({
      query: (id) => `/consultations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Consultation', id }],
    }),
    update: builder.mutation<Consultation, { id: string; data: Partial<Consultation> }>({
      query: ({ id, data }) => ({
        url: `/consultations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Consultation', id }],
    }),
    endConsultation: builder.mutation<any, string>({
      query: (id) => ({
        url: `/consultations/${id}/end`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Consultation', id }],
    }),
  }),
});

export const {
  useGetByAnimalQuery,
  useGetByIdQuery,
  useUpdateMutation,
  useEndConsultationMutation,
} = consultationsApi;
