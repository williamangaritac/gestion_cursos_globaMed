import api from '@/lib/axios';
import type { Program, ProgramFilters, PaginatedResponse } from '@/types';

export interface CreateProgramDto {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status?: string;
  instructorId?: string;
  maxStudents?: number;
  metadata?: Record<string, any>;
}

export interface UpdateProgramDto extends Partial<CreateProgramDto> {}

export const programsService = {
  async getAll(filters?: ProgramFilters): Promise<PaginatedResponse<Program>> {
    const response = await api.get<PaginatedResponse<Program>>('/programs', {
      params: filters,
    });
    return response.data;
  },

  async getById(id: string): Promise<Program> {
    const response = await api.get<Program>(`/programs/${id}`);
    return response.data;
  },

  async create(data: CreateProgramDto): Promise<Program> {
    const response = await api.post<Program>('/programs', data);
    return response.data;
  },

  async update(id: string, data: UpdateProgramDto): Promise<Program> {
    const response = await api.patch<Program>(`/programs/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/programs/${id}`);
    return response.data;
  },

  async publish(id: string): Promise<Program> {
    const response = await api.post<Program>(`/programs/${id}/publish`);
    return response.data;
  },

  async activate(id: string): Promise<Program> {
    const response = await api.post<Program>(`/programs/${id}/activate`);
    return response.data;
  },

  async archive(id: string): Promise<Program> {
    const response = await api.post<Program>(`/programs/${id}/archive`);
    return response.data;
  },
};

