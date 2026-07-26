import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials, setBootstrapped } from './authSlice';
import { authApi } from './authApi';
import { getToken } from '@/constants/api';
import { jwtToAuthUser } from './decode-jwt';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export async function bootstrapAuth() {
  const token = await getToken();
  const user = token ? jwtToAuthUser(token) : null;
  if (token && user) {
    store.dispatch(setCredentials({ user, token }));
  }
  store.dispatch(setBootstrapped());
}
