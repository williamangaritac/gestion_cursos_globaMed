import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  enrollmentsService,
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
} from '@/services/enrollments.service';
import type { Enrollment, EnrollmentFilters, PaginatedResponse } from '@/types';

interface EnrollmentsState {
  enrollments: Enrollment[];
  currentEnrollment: Enrollment | null;
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: EnrollmentsState = {
  enrollments: [],
  currentEnrollment: null,
  total: 0,
  page: 1,
  limit: 10,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchEnrollments = createAsyncThunk<
  PaginatedResponse<Enrollment>,
  EnrollmentFilters | undefined
>('enrollments/fetchAll', async (filters) => {
  return await enrollmentsService.getAll(filters);
});

export const fetchEnrollmentById = createAsyncThunk<Enrollment, string>(
  'enrollments/fetchById',
  async (id) => {
    return await enrollmentsService.getById(id);
  }
);

export const createEnrollment = createAsyncThunk<Enrollment, CreateEnrollmentDto>(
  'enrollments/create',
  async (data) => {
    return await enrollmentsService.create(data);
  }
);

export const updateEnrollment = createAsyncThunk<
  Enrollment,
  { id: string; data: UpdateEnrollmentDto }
>('enrollments/update', async ({ id, data }) => {
  return await enrollmentsService.update(id, data);
});

export const updateEnrollmentProgress = createAsyncThunk<
  Enrollment,
  { id: string; progress: number }
>('enrollments/updateProgress', async ({ id, progress }) => {
  return await enrollmentsService.updateProgress(id, progress);
});

export const completeEnrollment = createAsyncThunk<Enrollment, string>(
  'enrollments/complete',
  async (id) => {
    return await enrollmentsService.complete(id);
  }
);

export const dropEnrollment = createAsyncThunk<Enrollment, string>(
  'enrollments/drop',
  async (id) => {
    return await enrollmentsService.drop(id);
  }
);

// Slice
const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentEnrollment: (state) => {
      state.currentEnrollment = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all enrollments
    builder
      .addCase(fetchEnrollments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollments = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch enrollments';
      });

    // Fetch enrollment by ID
    builder
      .addCase(fetchEnrollmentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrollmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEnrollment = action.payload;
      })
      .addCase(fetchEnrollmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch enrollment';
      });

    // Create enrollment
    builder
      .addCase(createEnrollment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEnrollment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrollments.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createEnrollment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create enrollment';
      });

    // Update enrollment
    builder
      .addCase(updateEnrollment.fulfilled, (state, action) => {
        const index = state.enrollments.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.enrollments[index] = action.payload;
        }
        if (state.currentEnrollment?.id === action.payload.id) {
          state.currentEnrollment = action.payload;
        }
      })
      .addCase(updateEnrollmentProgress.fulfilled, (state, action) => {
        const index = state.enrollments.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.enrollments[index] = action.payload;
        }
        if (state.currentEnrollment?.id === action.payload.id) {
          state.currentEnrollment = action.payload;
        }
      })
      .addCase(completeEnrollment.fulfilled, (state, action) => {
        const index = state.enrollments.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.enrollments[index] = action.payload;
        }
        if (state.currentEnrollment?.id === action.payload.id) {
          state.currentEnrollment = action.payload;
        }
      })
      .addCase(dropEnrollment.fulfilled, (state, action) => {
        const index = state.enrollments.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.enrollments[index] = action.payload;
        }
        if (state.currentEnrollment?.id === action.payload.id) {
          state.currentEnrollment = action.payload;
        }
      });
  },
});

export const { clearError, clearCurrentEnrollment } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;

