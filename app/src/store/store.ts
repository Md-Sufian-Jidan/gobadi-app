import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials, setBootstrapped } from './authSlice';
import { authApi } from './authApi';
import { marketplaceApi } from './marketplaceApi';
import { medicalRecordsApi } from './medicalRecordsApi';
import { doctorPortalApi } from './doctorPortalApi';
import { animalsApi } from './animalsApi';
import { doctorsApi } from './doctorsApi';
import { tasksApi } from './tasksApi';
import { weatherApi } from './weatherApi';
import { alertsApi } from './alertsApi';
import { referralsApi } from './referralsApi';
import { chatApi } from './chatApi';
import { searchApi } from './searchApi';
import { usersApi } from './usersApi';
import { getToken, getRefreshToken } from '@/constants/api';
import { decodeJwt } from './decode-jwt';
import type { AuthUser } from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [marketplaceApi.reducerPath]: marketplaceApi.reducer,
    [medicalRecordsApi.reducerPath]: medicalRecordsApi.reducer,
    [doctorPortalApi.reducerPath]: doctorPortalApi.reducer,
    [animalsApi.reducerPath]: animalsApi.reducer,
    [doctorsApi.reducerPath]: doctorsApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
    [weatherApi.reducerPath]: weatherApi.reducer,
    [alertsApi.reducerPath]: alertsApi.reducer,
    [referralsApi.reducerPath]: referralsApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [searchApi.reducerPath]: searchApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      marketplaceApi.middleware,
      medicalRecordsApi.middleware,
      doctorPortalApi.middleware,
      animalsApi.middleware,
      doctorsApi.middleware,
      tasksApi.middleware,
      weatherApi.middleware,
      alertsApi.middleware,
      referralsApi.middleware,
      chatApi.middleware,
      searchApi.middleware,
      usersApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export async function bootstrapAuth() {
  const token = await getToken();
  const refreshToken = await getRefreshToken();
  // Decode without an expiry check: the 15-minute access token routinely
  // expires while the app is closed, but a valid refresh token means the
  // session is still good — baseQueryWithReauth will silently renew it on
  // the first request rather than forcing a fresh login here.
  const decoded = token ? decodeJwt(token) : null;
  const user: AuthUser | null = decoded
    ? { id: decoded.sub, phone: decoded.phone, role: decoded.role }
    : null;
  if (token && user && (refreshToken || decoded!.exp * 1000 > Date.now())) {
    store.dispatch(setCredentials({ user, token, refreshToken: refreshToken ?? undefined }));
  }
  store.dispatch(setBootstrapped());
}
