import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export type AttachmentStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';

export interface Attachment {
  id: number;
  patientId: number;
  appointmentId?: number | null;
  uploadedByUserId: number;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  storageUrl?: string;
  storagePublicId?: string;
  status: AttachmentStatus;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const medicalRecordsApi = createApi({
  reducerPath: 'medicalRecordsApi',
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
  tagTypes: ['MedicalRecord'],
  endpoints: (builder) => ({
    getMedicalRecords: builder.query<Attachment[], void>({
      query: () => '/medical-records',
      providesTags: ['MedicalRecord'],
    }),
    uploadMedicalRecord: builder.mutation<Attachment, FormData>({
      query: (formData) => ({
        url: '/medical-records/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['MedicalRecord'],
    }),
  }),
});

export const { useGetMedicalRecordsQuery, useUploadMedicalRecordMutation } = medicalRecordsApi;
