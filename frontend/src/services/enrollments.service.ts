import api from '@/lib/axios';
import type { Enrollment, EnrollmentFilters, PaginatedResponse } from '@/types';

export interface CreateEnrollmentDto {
  userId: string;
  programId: string;
  status?: string;
  progress?: number;
}

export interface UpdateEnrollmentDto {
  status?: string;
  progress?: number;
}

export const enrollmentsService = {
  async getAll(filters?: EnrollmentFilters): Promise<PaginatedResponse<Enrollment>> {
    const response = await api.get<PaginatedResponse<Enrollment>>('/enrollments', {
      params: filters,
    });
    return response.data;
  },

  async getById(id: string): Promise<Enrollment> {
    const response = await api.get<Enrollment>(`/enrollments/${id}`);
    return response.data;
  },

  async create(data: CreateEnrollmentDto): Promise<Enrollment> {
    const response = await api.post<Enrollment>('/enrollments', data);
    return response.data;
  },

  async update(id: string, data: UpdateEnrollmentDto): Promise<Enrollment> {
    const response = await api.patch<Enrollment>(`/enrollments/${id}`, data);
    return response.data;
  },

  async updateProgress(id: string, progress: number): Promise<Enrollment> {
    const response = await api.patch<Enrollment>(`/enrollments/${id}/progress/${progress}`);
    return response.data;
  },

  async complete(id: string): Promise<Enrollment> {
    const response = await api.post<Enrollment>(`/enrollments/${id}/complete`);
    return response.data;
  },

  async drop(id: string): Promise<Enrollment> {
    const response = await api.post<Enrollment>(`/enrollments/${id}/drop`);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/enrollments/${id}`);
    return response.data;
  },
};

