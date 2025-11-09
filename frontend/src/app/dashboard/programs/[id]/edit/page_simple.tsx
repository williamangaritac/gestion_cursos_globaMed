'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProgramById, updateProgram } from '@/store/slices/programsSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProgramStatus } from '@/types';

const updateProgramSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  maxStudents: z.number().min(1, 'Debe haber al menos 1 estudiante').max(1000, 'Máximo 1000 estudiantes'),
  status: z.nativeEnum(ProgramStatus),
});

type UpdateProgramForm = z.infer<typeof updateProgramSchema>;

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { currentProgram, isLoading } = useAppSelector((state) => state.programs);
  const programId = params.id as string;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateProgramForm>({
    resolver: zodResolver(updateProgramSchema),
  });

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
        status: currentProgram.status,
      });
    }
  }, [currentProgram, reset]);

  const onSubmit = async (data: UpdateProgramForm) => {
    try {
      await dispatch(updateProgram({ id: programId, ...data })).unwrap();
      alert('Programa actualizado exitosamente');
      router.push(`/dashboard/programs/${programId}`);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar programa');
    }
  };

  if (isLoading || !currentProgram) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-6">
        Editar Programa
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
            <input
              {...register('startDate')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
            <input
              {...register('endDate')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de Estudiantes</label>
          <input
            {...register('maxStudents', { valueAsNumber: true })}
            type="number"
            min="1"
            max="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {errors.maxStudents && <p className="mt-1 text-sm text-red-600">{errors.maxStudents.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value={ProgramStatus.DRAFT}>Borrador</option>
            <option value={ProgramStatus.PUBLISHED}>Publicado</option>
            <option value={ProgramStatus.ACTIVE}>Activo</option>
            <option value={ProgramStatus.COMPLETED}>Completado</option>
            <option value={ProgramStatus.ARCHIVED}>Archivado</option>
          </select>
          {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/programs/${programId}`)}
            className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

