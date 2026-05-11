import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { request } from './api';

interface ProgressState {
  report: any;
  daily: any;
  resume: any;
  loading: boolean;
  studentReport: any;
  studentDaily: any;
}

const initialState: ProgressState = {
  report: null,
  daily: null,
  resume: null,
  loading: false,
  studentReport: null,
  studentDaily: null,
};

export const markSolved = createAsyncThunk('progress/markSolved', async (problemId: number) => {
  return request(`/progress/solved/${problemId}`, { method: 'POST' });
});

export const fetchProgress = createAsyncThunk('progress/fetchReport', async () => {
  return request('/progress/report');
});

export const fetchDailyStats = createAsyncThunk('progress/fetchDaily', async () => {
  return request('/progress/daily');
});

export const fetchResume = createAsyncThunk('progress/fetchResume', async () => {
  return request('/progress/resume');
});

export const fetchStudentProgress = createAsyncThunk('progress/fetchStudentReport', async (userId: number) => {
  return request(`/progress/report/${userId}`);
});

export const fetchStudentDaily = createAsyncThunk('progress/fetchStudentDaily', async (userId: number) => {
  return request(`/progress/daily/${userId}`);
});

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgress.pending, (state) => { state.loading = true; })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.report = action.payload;
        state.loading = false;
      })
      .addCase(fetchProgress.rejected, (state) => { state.loading = false; })
      .addCase(fetchDailyStats.fulfilled, (state, action) => { state.daily = action.payload; })
      .addCase(fetchResume.fulfilled, (state, action) => { state.resume = action.payload; })
      .addCase(fetchStudentProgress.fulfilled, (state, action) => { state.studentReport = action.payload; })
      .addCase(fetchStudentDaily.fulfilled, (state, action) => { state.studentDaily = action.payload; });
  },
});

export default progressSlice.reducer;
