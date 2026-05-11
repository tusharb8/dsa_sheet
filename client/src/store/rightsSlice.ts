import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { request } from './api';

interface RightsState {
  list: any[];
  loading: boolean;
}

const initialState: RightsState = {
  list: [],
  loading: false,
};

export const fetchRights = createAsyncThunk('rights/fetchAll', async () => {
  return request('/rights');
});

export const createRight = createAsyncThunk('rights/create', async (data: any) => {
  return request('/rights', { method: 'POST', body: JSON.stringify(data) });
});

export const deleteRight = createAsyncThunk('rights/delete', async (id: number) => {
  await request(`/rights/${id}`, { method: 'DELETE' });
  return id;
});

const rightsSlice = createSlice({
  name: 'rights',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRights.pending, (state) => { state.loading = true; })
      .addCase(fetchRights.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchRights.rejected, (state) => { state.loading = false; })
      .addCase(deleteRight.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r.id !== action.payload);
      });
  },
});

export default rightsSlice.reducer;
