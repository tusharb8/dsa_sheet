import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { request } from './api';

export interface Resource {
  id: number;
  title: string;
  url: string;
  type: string;
}

export interface Problem {
  id: number;
  title: string;
  url: string;
  difficulty: string;
}

export interface Topic {
  id: number;
  name: string;
  orderIndex: number;
  resources: Resource[];
  problems: Problem[];
}

interface TopicsState {
  list: Topic[];
  current: Topic | null;
  loading: boolean;
}

const initialState: TopicsState = {
  list: [],
  current: null,
  loading: false,
};

export const fetchTopics = createAsyncThunk('topics/fetchAll', async () => {
  return request('/topics') as Promise<Topic[]>;
});

export const fetchTopic = createAsyncThunk('topics/fetchOne', async (id: number) => {
  return request(`/topics/${id}`) as Promise<Topic>;
});

const topicsSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopics.pending, (state) => { state.loading = true; })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchTopics.rejected, (state) => { state.loading = false; })
      .addCase(fetchTopic.pending, (state) => { state.loading = true; })
      .addCase(fetchTopic.fulfilled, (state, action) => {
        state.current = action.payload;
        state.loading = false;
      })
      .addCase(fetchTopic.rejected, (state) => { state.loading = false; });
  },
});

export default topicsSlice.reducer;
