import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export interface DoctorSummary {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  avatar: string;
  bio: string;
}

export const doctorsApi = createApi({
  reducerPath: 'doctorsApi',
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
  tagTypes: ['Doctor'],
  endpoints: (builder) => ({
    getDoctors: builder.query<DoctorSummary[], void>({
      query: () => '/doctors',
      providesTags: (result) =>
        result
          ? [...result.map((d) => ({ type: 'Doctor' as const, id: d.id })), { type: 'Doctor', id: 'LIST' }]
          : [{ type: 'Doctor', id: 'LIST' }],
    }),
    getDoctorById: builder.query<DoctorSummary, string>({
      query: (id) => `/doctors/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Doctor', id }],
    }),
    getSlots: builder.query<string[], { doctorId: string; date: string }>({
      query: ({ doctorId, date }) => `/doctors/${doctorId}/slots?date=${date}`,
    }),
    bookSlot: builder.mutation<void, { doctorId: string; date: string; time: string }>({
      query: (body) => ({ url: '/doctors/book', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useGetSlotsQuery,
  useBookSlotMutation,
} = doctorsApi;
