import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usersService, CreateUserDto, UpdateUserDto } from '@/services/users.service';
import { User } from '@/types';

interface UsersState {
  users: User[];
  currentUser: User | null;
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  total: 0,
  page: 1,
  limit: 10,
  isLoading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) => {
    const response = await usersService.getUsers(params);
    return response;
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: string) => {
    const response = await usersService.getUserById(id);
    return response;
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (data: CreateUserDto) => {
    const response = await usersService.createUser(data);
    return response;
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: string; data: UpdateUserDto }) => {
    const response = await usersService.updateUser(id, data);
    return response;
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string) => {
    await usersService.deleteUser(id);
    return id;
  }
);

export const restoreUser = createAsyncThunk(
  'users/restoreUser',
  async (id: string) => {
    const response = await usersService.restoreUser(id);
    return response;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user';
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create user';
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update user';
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter((u) => u.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete user';
      })
      // Restore user
      .addCase(restoreUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(restoreUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to restore user';
      });
  },
});

export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;

