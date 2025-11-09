import api from '@/lib/axios';
import { User } from '@/types';

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role?: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
  role?: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
}

export const usersService = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>('/users', { params });
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserDto): Promise<User> {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async restoreUser(id: string): Promise<User> {
    const response = await api.post<User>(`/users/${id}/restore`);
    return response.data;
  },
};

