import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { request } from './api';

export interface User {
  id: number;
  email: string;
  name: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: true,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user as User;
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user as User;
  },
);

export const adminCreateUser = createAsyncThunk(
  'auth/adminCreateUser',
  async ({ email, password, name, role }: { email: string; password: string; name: string; role?: string }) => {
    return request('/auth/admin/create-user', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    initAuth(state) {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('user');
      if (token && stored) {
        state.user = JSON.parse(stored);
      }
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, initAuth } = authSlice.actions;
export default authSlice.reducer;
