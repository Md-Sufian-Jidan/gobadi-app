import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL, setToken, clearToken } from '@/constants/api';
import { setCredentials, clearCredentials } from './authSlice';
import type { AuthUser } from './authSlice';
import { jwtToAuthUser } from './decode-jwt';
import type { RootState, AppDispatch } from './store';

interface SessionResponse {
  token: string;
  user?: Partial<AuthUser>;
}

interface MessageResponse {
  success: boolean;
  message: string;
}

interface OtpResponse extends MessageResponse {
  otp?: string;
}

interface VerifyOtpResponse {
  verified: boolean;
  token?: string;
  resetToken?: string;
  user?: Partial<AuthUser>;
  message: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
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
    register: builder.mutation<
      MessageResponse,
      { name?: string; phone: string; email?: string; password: string; role: string }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),

    login: builder.mutation<SessionResponse, { identifier: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        await persistSession(dispatch, queryFulfilled);
      },
    }),

    sendOtp: builder.mutation<OtpResponse, { phone: string; purpose?: 'login' | 'verify' | 'reset' }>({
      query: (body) => ({ url: '/auth/send-otp', method: 'POST', body }),
    }),

    verifyOtp: builder.mutation<
      VerifyOtpResponse,
      { phone: string; code: string; purpose?: 'login' | 'verify' | 'reset' }
    >({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        if (data.token) {
          const user = (data.user as AuthUser) ?? jwtToAuthUser(data.token);
          dispatch(setCredentials({ user, token: data.token }));
          await setToken(data.token);
        }
      },
    }),

    forgotPassword: builder.mutation<MessageResponse, { identifier: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    resetPassword: builder.mutation<MessageResponse, { resetToken: string; newPassword: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),

    googleAuth: builder.mutation<SessionResponse, { idToken: string }>({
      query: (body) => ({ url: '/auth/oauth/google', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        await persistSession(dispatch, queryFulfilled);
      },
    }),

    facebookAuth: builder.mutation<SessionResponse, { accessToken: string }>({
      query: (body) => ({ url: '/auth/oauth/facebook', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        await persistSession(dispatch, queryFulfilled);
      },
    }),
  }),
});

async function persistSession(
  dispatch: AppDispatch,
  queryFulfilled: Promise<{ data: SessionResponse }>,
) {
  const { data } = await queryFulfilled;
  const user = (data.user as AuthUser) ?? jwtToAuthUser(data.token);
  dispatch(setCredentials({ user, token: data.token }));
  await setToken(data.token);
}

export async function logout(dispatch: AppDispatch) {
  dispatch(clearCredentials());
  await clearToken();
}

export const {
  useRegisterMutation,
  useLoginMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGoogleAuthMutation,
  useFacebookAuthMutation,
} = authApi;
