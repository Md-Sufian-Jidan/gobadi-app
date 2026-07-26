import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: number;
  phone: string;
  email?: string;
  role: string;
  name?: string;
  verified?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isBootstrapping: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isBootstrapping: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser | null; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearCredentials(state) {
      state.user = null;
      state.token = null;
    },
    setBootstrapped(state) {
      state.isBootstrapping = false;
    },
  },
});

export const { setCredentials, clearCredentials, setBootstrapped } = authSlice.actions;
export default authSlice.reducer;
