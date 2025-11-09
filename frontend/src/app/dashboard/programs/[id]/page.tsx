'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchProgramById, deleteProgram } from '@/store/slices/programsSlice';
import { createEnrollment, fetchEnrollments } from '@/store/slices/enrollmentsSlice';

export default function ProgramDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { currentProgram, isLoading } = useAppSelector((state) => state.programs);
  const { user } = useAppSelector((state) => state.auth);
  const { enrollments } = useAppSelector((state) => state.enrollments);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const programId = params.id as string;

  useEffect(() => {
    if (programId) {
      dispatch(fetchProgramById(programId));
    }
  }, [dispatch, programId]);

  // Cargar inscripciones del usuario si es estudiante
  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      dispatch(fetchEnrollments({ userId: user.id, page: 1, limit: 100 }));
    }
  }, [dispatch, user]);

  const handleEnroll = async () => {
    if (!user || !currentProgram) return;

    // Verificación adicional antes de enviar
    if (isEnrolled) {
      setEnrollError('Ya estás inscrito en este programa');
      return;
    }

    try {
      setEnrolling(true);
      setEnrollError(null);

      await dispatch(createEnrollment({
        userId: user.id,
        programId: currentProgram.id,
      })).unwrap();

      alert('¡Te has inscrito exitosamente al programa!');

      // Recargar inscripciones para actualizar el estado
      if (user.role === 'STUDENT') {
        dispatch(fetchEnrollments({ userId: user.id, page: 1, limit: 100 }));
      }

      router.push('/dashboard/my-enrollments');
    } catch (err: any) {
      // Manejar error de inscripción duplicada
      if (err.message && err.message.includes('already enrolled')) {
        setEnrollError('Ya estás inscrito en este programa');
        // Recargar inscripciones para actualizar el estado
        if (user.role === 'STUDENT') {
          dispatch(fetchEnrollments({ userId: user.id, page: 1, limit: 100 }));
        }
      } else {
        setEnrollError(err.message || 'Error al inscribirse al programa');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProgram) return;

    try {
      await dispatch(deleteProgram(currentProgram.id)).unwrap();
      alert('Programa eliminado exitosamente');
      router.push('/dashboard/programs');
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el programa');
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
        <p className="text-gray-600">Programa no encontrado</p>
        <button
          onClick={() => router.push('/dashboard/programs')}
          className="mt-4 text-green-600 hover:text-green-700 font-medium"
        >
          Volver a Programas
        </button>
      </div>
    );
  }

  const canEdit = user && (user.role === 'ADMIN' || user.role === 'INSTRUCTOR');
  const canDelete = user && user.role === 'ADMIN';

  // Verificar si el usuario ya está inscrito en este programa
  const isEnrolled = enrollments.some(
    (enrollment) => enrollment.programId === programId && enrollment.status === 'ACTIVE'
  );

  const canEnroll = user && user.role === 'STUDENT' && currentProgram.status === 'ACTIVE' && !isEnrolled;
  const isFull = currentProgram.currentStudents >= currentProgram.maxStudents;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PUBLISHED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
      ARCHIVED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/dashboard/programs')}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center"
          >
            ← Back to Programs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{currentProgram.name}</h1>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentProgram.status)}`}>
          {currentProgram.status}
        </span>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Program Info */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{currentProgram.description}</p>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
            <p className="text-gray-900">{new Date(currentProgram.startDate).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
            <p className="text-gray-900">{new Date(currentProgram.endDate).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Capacity</h3>
            <p className="text-gray-900">
              {currentProgram.currentStudents} / {currentProgram.maxStudents} students
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(currentProgram.currentStudents / currentProgram.maxStudents) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Instructor</h3>
            <p className="text-gray-900">{currentProgram.instructorId || 'Not assigned'}</p>
          </div>
        </div>

        {/* Sección de Inscripción para Estudiantes */}
        {user && user.role === 'STUDENT' && currentProgram.status === 'ACTIVE' && (
          <div className="p-6 bg-gradient-to-br from-green-50 to-white border-t border-green-200">
            {enrollError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {enrollError}
              </div>
            )}

            {isEnrolled ? (
              <div className="text-center py-4">
                <p className="text-green-600 font-medium">✓ Ya estás inscrito en este programa</p>
                <p className="text-gray-600 text-sm mt-1">Puedes ver tu progreso en "Mis Inscripciones"</p>
                <button
                  onClick={() => router.push('/dashboard/my-enrollments')}
                  className="mt-3 text-green-600 hover:text-green-700 font-medium underline"
                >
                  Ver Mis Inscripciones
                </button>
              </div>
            ) : isFull ? (
              <div className="text-center py-4">
                <p className="text-red-600 font-medium">Este programa está lleno</p>
                <p className="text-gray-600 text-sm mt-1">No hay cupos disponibles</p>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {enrolling ? 'Inscribiendo...' : 'Inscribirse a este Programa'}
              </button>
            )}
          </div>
        )}

        {/* Acciones para Admin/Instructor */}
        {(canEdit || canDelete) && (
          <div className="p-6 bg-gray-50 border-t flex items-center justify-end space-x-4">
            {canEdit && (
              <button
                onClick={() => router.push(`/dashboard/programs/${currentProgram.id}/edit`)}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium"
              >
                Editar Programa
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium"
              >
                Eliminar Programa
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar "{currentProgram.name}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

