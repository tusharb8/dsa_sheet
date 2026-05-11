import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { request } from './api';

interface RolesState {
  list: any[];
  loading: boolean;
}

const initialState: RolesState = {
  list: [],
  loading: false,
};

export const fetchRoles = createAsyncThunk('roles/fetchAll', async () => {
  return request('/roles');
});

export const createRole = createAsyncThunk('roles/create', async (data: any) => {
  return request('/roles', { method: 'POST', body: JSON.stringify(data) });
});

export const updateRole = createAsyncThunk('roles/update', async ({ id, data }: { id: number; data: any }) => {
  return request(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
});

export const deleteRole = createAsyncThunk('roles/delete', async (id: number) => {
  await request(`/roles/${id}`, { method: 'DELETE' });
  return id;
});

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => { state.loading = true; })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchRoles.rejected, (state) => { state.loading = false; })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r.id !== action.payload);
      });
  },
});

export default rolesSlice.reducer;
