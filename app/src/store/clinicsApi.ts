import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export interface Clinic {
  id: number;
  userId: number;
  name: string;
  location: string;
  description: string;
  avatar?: string;
  businessHours?: any;
  rating: number;
  isVerified: boolean;
  doctors: any[];
}

export const clinicsApi = createApi({
  reducerPath: 'clinicsApi',
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
  endpoints: (builder) => ({
    getClinics: builder.query<Clinic[], void>({
      query: () => '/clinics',
    }),
    getClinic: builder.query<Clinic, number>({
      query: (id) => `/clinics/${id}`,
    }),
  }),
});

export const {
  useGetClinicsQuery,
  useGetClinicQuery,
} = clinicsApi;
