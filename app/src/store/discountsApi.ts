import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './base-query-with-reauth';

export interface Patient {
  id: number;
  name: string;
  phone: string;
  animalName?: string;
  hasActiveDiscount?: boolean;
  discountPercentage?: number;
}

export interface Discount {
  id: number;
  patientId: number;
  doctorId: number;
  percentage: number;
  type: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AvailableDiscount {
  id: number;
  code: string;
  description: string;
  percentage: number;
  type: string;
  expiresAt: string;
  isActive: boolean;
}

export interface MyDiscount {
  id: number;
  code: string;
  percentage: number;
  type: string;
  usedAt?: string;
  expiresAt: string;
}

export interface ApplyDiscountInput {
  patientId: number;
  percentage: number;
  type: string;
  expiresAt?: string;
}

export interface DiscountValidation {
  valid: boolean;
  discount?: AvailableDiscount;
  message: string;
}

export const discountsApi = createApi({
  reducerPath: 'discountsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Discount', 'PatientDiscount'],
  endpoints: (builder) => ({
    getMyPatients: builder.query<Patient[], { search?: string; discountGiven?: string }>({
      query: (params) => ({
        url: '/doctors/me/patients',
        params,
      }),
      providesTags: ['PatientDiscount'],
    }),
    getDiscountForPatient: builder.query<Discount, string>({
      query: (patientId) => `/discounts/${patientId}`,
      providesTags: (_result, _error, patientId) => [{ type: 'Discount', id: patientId }],
    }),
    applyDiscount: builder.mutation<Discount, ApplyDiscountInput>({
      query: (body) => ({
        url: '/discounts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Discount', 'PatientDiscount'],
    }),
    editDiscount: builder.mutation<Discount, { id: number; data: Partial<Discount> }>({
      query: ({ id, data }) => ({
        url: `/discounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Discount', 'PatientDiscount'],
    }),
    removeDiscount: builder.mutation<void, number>({
      query: (id) => ({
        url: `/discounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Discount', 'PatientDiscount'],
    }),
    getAvailableDiscounts: builder.query<AvailableDiscount[], void>({
      query: () => '/discounts/available',
      providesTags: ['Discount'],
    }),
    validateDiscount: builder.mutation<DiscountValidation, { code: string }>({
      query: (body) => ({
        url: '/discounts/validate',
        method: 'POST',
        body,
      }),
    }),
    applyDiscountCode: builder.mutation<any, { code: string; appointmentId: number }>({
      query: (body) => ({
        url: '/discounts/apply',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Discount'],
    }),
    getMyDiscounts: builder.query<MyDiscount[], void>({
      query: () => '/discounts/my',
      providesTags: ['Discount'],
    }),
  }),
});

export const {
  useGetMyPatientsQuery,
  useGetDiscountForPatientQuery,
  useApplyDiscountMutation,
  useEditDiscountMutation,
  useRemoveDiscountMutation,
  useGetAvailableDiscountsQuery,
  useValidateDiscountMutation,
  useApplyDiscountCodeMutation,
  useGetMyDiscountsQuery,
} = discountsApi;
