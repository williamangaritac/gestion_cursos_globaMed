'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProgramById, updateProgram } from '@/store/slices/programsSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const updateProgramSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  maxStudents: z.number().min(1, 'Max students must be at least 1').max(1000, 'Max students cannot exceed 1000'),
  instructorId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'ARCHIVED']),
});

type UpdateProgramForm = z.infer<typeof updateProgramSchema>;

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { currentProgram, isLoading, error } = useAppSelector((state) => state.programs);
  const { user } = useAppSelector((state) => state.auth);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const programId = params.id as string;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProgramForm>({
    resolver: zodResolver(updateProgramSchema),
  });

  useEffect(() => {
    // Only ADMIN and INSTRUCTOR can edit programs
    if (user && user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
      router.push('/dashboard/programs');
    }
  }, [user, router]);

  useEffect(() => {
    if (programId) {
      dispatch(fetchProgramById(programId));
    }
  }, [dispatch, programId]);

  useEffect(() => {
    if (currentProgram) {
      reset({
        name: currentProgram.name,
        description: currentProgram.description,
        startDate: currentProgram.startDate.split('T')[0],
        endDate: currentProgram.endDate.split('T')[0],
        maxStudents: currentProgram.maxStudents,
        instructorId: currentProgram.instructorId || '',
        status: currentProgram.status as any,
      });
    }
  }, [currentProgram, reset]);

  const onSubmit = async (data: UpdateProgramForm) => {
    if (!currentProgram) return;

    try {
      setSubmitError(null);
      
      const programData = {
        ...data,
        maxStudents: Number(data.maxStudents),
        instructorId: data.instructorId || undefined,
      };

      await dispatch(updateProgram({
        id: currentProgram.id,
        data: programData,
      })).unwrap();
      
      router.push(`/dashboard/programs/${currentProgram.id}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to update program');
    }
  };

  if (isLoading && !currentProgram) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading program...</p>
        </div>
      </div>
    );
  }

  if (!currentProgram) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Program not found</p>
        <button
          onClick={() => router.push('/dashboard/programs')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Programs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/programs/${currentProgram.id}`)}
          className="text-blue-600 hover:text-blue-700 mb-2 flex items-center"
        >
          ← Back to Program
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Program</h1>
        <p className="text-gray-600 mt-2">Update program details</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Program Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              {...register('status')}
              id="status"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                {...register('startDate')}
                type="date"
                id="startDate"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                {...register('endDate')}
                type="date"
                id="endDate"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Max Students */}
          <div>
            <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Students *
            </label>
            <input
              {...register('maxStudents', { valueAsNumber: true })}
              type="number"
              id="maxStudents"
              min="1"
              max="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.maxStudents && (
              <p className="mt-1 text-sm text-red-600">{errors.maxStudents.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Current enrollments: {currentProgram.currentStudents}
            </p>
          </div>

          {/* Instructor ID */}
          <div>
            <label htmlFor="instructorId" className="block text-sm font-medium text-gray-700 mb-2">
              Instructor ID (Optional)
            </label>
            <input
              {...register('instructorId')}
              type="text"
              id="instructorId"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.instructorId && (
              <p className="mt-1 text-sm text-red-600">{errors.instructorId.message}</p>
            )}
          </div>

          {/* Error Message */}
          {(submitError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {submitError || error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/programs/${currentProgram.id}`)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

