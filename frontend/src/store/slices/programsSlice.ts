import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { programsService, CreateProgramDto, UpdateProgramDto } from '@/services/programs.service';
import type { Program, ProgramFilters, PaginatedResponse } from '@/types';

interface ProgramsState {
  programs: Program[];
  currentProgram: Program | null;
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProgramsState = {
  programs: [],
  currentProgram: null,
  total: 0,
  page: 1,
  limit: 10,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPrograms = createAsyncThunk<PaginatedResponse<Program>, ProgramFilters | undefined>(
  'programs/fetchAll',
  async (filters) => {
    return await programsService.getAll(filters);
  }
);

export const fetchProgramById = createAsyncThunk<Program, string>(
  'programs/fetchById',
  async (id) => {
    return await programsService.getById(id);
  }
);

export const createProgram = createAsyncThunk<Program, CreateProgramDto>(
  'programs/create',
  async (data) => {
    return await programsService.create(data);
  }
);

export const updateProgram = createAsyncThunk<Program, { id: string; data: UpdateProgramDto }>(
  'programs/update',
  async ({ id, data }) => {
    return await programsService.update(id, data);
  }
);

export const deleteProgram = createAsyncThunk<string, string>(
  'programs/delete',
  async (id) => {
    await programsService.delete(id);
    return id;
  }
);

// Slice
const programsSlice = createSlice({
  name: 'programs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProgram: (state) => {
      state.currentProgram = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all programs
    builder
      .addCase(fetchPrograms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.programs = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch programs';
      });

    // Fetch program by ID
    builder
      .addCase(fetchProgramById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProgramById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProgram = action.payload;
      })
      .addCase(fetchProgramById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch program';
      });

    // Create program
    builder
      .addCase(createProgram.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProgram.fulfilled, (state, action) => {
        state.isLoading = false;
        state.programs.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createProgram.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create program';
      });

    // Update program
    builder
      .addCase(updateProgram.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProgram.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.programs.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.programs[index] = action.payload;
        }
        if (state.currentProgram?.id === action.payload.id) {
          state.currentProgram = action.payload;
        }
      })
      .addCase(updateProgram.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update program';
      });

    // Delete program
    builder
      .addCase(deleteProgram.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProgram.fulfilled, (state, action) => {
        state.isLoading = false;
        state.programs = state.programs.filter((p) => p.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteProgram.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete program';
      });
  },
});

export const { clearError, clearCurrentProgram } = programsSlice.actions;
export default programsSlice.reducer;

