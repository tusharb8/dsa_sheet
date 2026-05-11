import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { request } from './api';

interface UsersState {
  list: any[];
  loading: boolean;
}

const initialState: UsersState = {
  list: [],
  loading: false,
};

export const fetchUsers = createAsyncThunk('users/fetchAll', async (role?: string) => {
  const query = role ? `?role=${role}` : '';
  return request(`/users${query}`);
});

export const deleteUser = createAsyncThunk('users/delete', async (id: number) => {
  await request(`/users/${id}`, { method: 'DELETE' });
  return id;
});

export const toggleDisableUser = createAsyncThunk('users/toggleDisable', async (id: number) => {
  const user = await request(`/users/${id}/disable`, { method: 'PATCH' });
  return user;
});

export const changePassword = createAsyncThunk(
  'users/changePassword',
  async ({ id, password }: { id: number; password: string }) => {
    return request(`/users/${id}/change-password`, {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    });
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state) => { state.loading = false; })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
      })
      .addCase(toggleDisableUser.fulfilled, (state, action) => {
        const idx = state.list.findIndex((u: any) => u.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      });
  },
});

export default usersSlice.reducer;
