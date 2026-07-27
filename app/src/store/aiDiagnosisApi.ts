import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@/constants/api';
import type { RootState } from './store';

export interface AiDiagnosis {
  id: number;
  userId: number;
  images: string[];
  symptoms: string[];
  analysisResult: string;
  confidenceScore: number;
  recommendations: string[];
  recommendedDoctorIds: number[];
  createdAt: string;
}

export const aiDiagnosisApi = createApi({
  reducerPath: 'aiDiagnosisApi',
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
  tagTypes: ['AiDiagnosis'],
  endpoints: (builder) => ({
    getDiagnosisHistory: builder.query<AiDiagnosis[], void>({
      query: () => '/ai-diagnosis/history',
      providesTags: [{ type: 'AiDiagnosis', id: 'LIST' }],
    }),
    analyzeSymptoms: builder.mutation<AiDiagnosis, { symptoms: string[]; images?: string[] }>({
      query: (body) => ({
        url: '/ai-diagnosis/analyze',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AiDiagnosis', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetDiagnosisHistoryQuery,
  useAnalyzeSymptomsMutation,
} = aiDiagnosisApi;
