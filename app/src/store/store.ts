import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials, setBootstrapped } from './authSlice';
import { authApi } from './authApi';
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
import { productsApi } from './productsApi';
import { livestockApi } from './livestockApi';
import { cartApi } from './cartApi';
import { wishlistApi } from './wishlistApi';
import { ordersApi } from './ordersApi';
import { paymentsApi } from './paymentsApi';
import { deliveryApi } from './deliveryApi';
import { clinicsApi } from './clinicsApi';
import { servicesApi } from './servicesApi';
import { aiDiagnosisApi } from './aiDiagnosisApi';
import { reviewsApi } from './reviewsApi';
import { notificationsApi } from './notificationsApi';
import { getToken, getRefreshToken } from '@/constants/api';
import { decodeJwt } from './decode-jwt';
import type { AuthUser } from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
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
    [productsApi.reducerPath]: productsApi.reducer,
    [livestockApi.reducerPath]: livestockApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [deliveryApi.reducerPath]: deliveryApi.reducer,
    [clinicsApi.reducerPath]: clinicsApi.reducer,
    [servicesApi.reducerPath]: servicesApi.reducer,
    [aiDiagnosisApi.reducerPath]: aiDiagnosisApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
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
      productsApi.middleware,
      livestockApi.middleware,
      cartApi.middleware,
      wishlistApi.middleware,
      ordersApi.middleware,
      paymentsApi.middleware,
      deliveryApi.middleware,
      clinicsApi.middleware,
      servicesApi.middleware,
      aiDiagnosisApi.middleware,
      reviewsApi.middleware,
      notificationsApi.middleware,
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
