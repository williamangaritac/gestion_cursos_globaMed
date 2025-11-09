'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProgramById, deleteProgram } from '@/store/slices/programsSlice';
import { createEnrollment } from '@/store/slices/enrollmentsSlice';

export default function ProgramDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { currentProgram, isLoading } = useAppSelector((state) => state.programs);
  const { user } = useAppSelector((state) => state.auth);
  const [enrolling, setEnrolling] = useState(false);

  const programId = params.id as string;

  useEffect(() => {
    if (programId) {
      dispatch(fetchProgramById(programId));
    }
  }, [dispatch, programId]);

  const handleEnroll = async () => {
    if (!user || !currentProgram) return;

    try {
      setEnrolling(true);
      await dispatch(createEnrollment({
        userId: user.id,
        programId: currentProgram.id,
      })).unwrap();

      alert('¡Inscripción exitosa!');
      router.push('/dashboard/my-enrollments');
    } catch (err: any) {
      alert(err.message || 'Error al inscribirse');
    } finally {
      setEnrolling(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProgram) return;
    if (!confirm('¿Estás seguro de eliminar este programa?')) return;

    try {
      await dispatch(deleteProgram(currentProgram.id)).unwrap();
      alert('Programa eliminado exitosamente');
      router.push('/dashboard/programs');
    } catch (err: any) {
      alert(err.message || 'Error al eliminar programa');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando programa...</p>
        </div>
      </div>
    );
  }

  if (!currentProgram) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Programa no encontrado</p>
        <button
          onClick={() => router.push('/dashboard/programs')}
          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium"
        >
          Volver a Programas
        </button>
      </div>
    );
  }

  const canEdit = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';
  const canEnroll = user?.role === 'STUDENT';

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
            {currentProgram.name}
          </h1>
          <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full">
            {currentProgram.status}
          </span>
        </div>
        <div className="flex gap-3">
          {canEdit && (
            <>
              <button
                onClick={() => router.push(`/dashboard/programs/${currentProgram.id}/edit`)}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium"
              >
                Editar
              </button>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={handleDelete}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium"
                >
                  Eliminar
                </button>
              )}
            </>
          )}
          {canEnroll && (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {enrolling ? 'Inscribiendo...' : 'Inscribirse'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-lg border border-green-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h2>
          <p className="text-gray-700">{currentProgram.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Fecha de Inicio</h3>
            <p className="text-gray-900">{new Date(currentProgram.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Fecha de Fin</h3>
            <p className="text-gray-900">{new Date(currentProgram.endDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Estudiantes</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                style={{ width: `${(currentProgram.currentStudents / currentProgram.maxStudents) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {currentProgram.currentStudents} / {currentProgram.maxStudents}
            </span>
          </div>
        </div>

        {currentProgram.instructor && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Instructor</h3>
            <p className="text-gray-900">{currentProgram.instructor.fullName}</p>
            <p className="text-sm text-gray-600">{currentProgram.instructor.email}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={() => router.push('/dashboard/programs')}
          className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition"
        >
          Volver a Programas
        </button>
      </div>
    </div>
  );
}

