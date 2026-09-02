import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface MedicalEvent {
  id: number;
  animalId: number;
  doctorId: number;
  type: string;
  title: string;
  description?: string;
  diagnosis?: string;
  treatment?: string;
  followUpDate?: string;
  attachments?: string[];
  status: string;
  createdAt: string;
}

export interface CreateMedicalEventInput {
  type: string;
  title: string;
  description?: string;
  diagnosis?: string;
  treatment?: string;
  followUpDate?: string;
}

export const medicalEventsApi = createApi({
  reducerPath: 'medicalEventsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['MedicalEvent'],
  endpoints: (builder) => ({
    getByAnimal: builder.query<MedicalEvent[], { animalId: string; type?: string; page?: string; limit?: string }>({
      query: ({ animalId, ...params }) => ({
        url: `/animals/${animalId}/medical-events`,
        params,
      }),
      providesTags: (_result, _error, { animalId }) => [{ type: 'MedicalEvent', id: animalId }],
    }),
    create: builder.mutation<MedicalEvent, { animalId: string; data: CreateMedicalEventInput }>({
      query: ({ animalId, data }) => ({
        url: `/animals/${animalId}/medical-events`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { animalId }) => [
        { type: 'MedicalEvent', id: animalId },
      ],
    }),
    getById: builder.query<MedicalEvent, string>({
      query: (id) => `/medical-events/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'MedicalEvent', id }],
    }),
    update: builder.mutation<MedicalEvent, { id: string; data: Partial<MedicalEvent> }>({
      query: ({ id, data }) => ({
        url: `/medical-events/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'MedicalEvent', id }],
    }),
    remove: builder.mutation<void, string>({
      query: (id) => ({
        url: `/medical-events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'MedicalEvent', id }],
    }),
  }),
});

export const {
  useGetByAnimalQuery,
  useCreateMutation,
  useGetByIdQuery,
  useUpdateMutation,
  useRemoveMutation,
} = medicalEventsApi;
