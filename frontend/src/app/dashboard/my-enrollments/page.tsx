'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchEnrollments } from '@/store/slices/enrollmentsSlice';

export default function MyEnrollmentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { enrollments, isLoading } = useAppSelector((state) => state.enrollments);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Cargar inscripciones del usuario actual
    if (user?.id) {
      dispatch(fetchEnrollments({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
          Mis Inscripciones
        </h1>
        <p className="text-gray-600 mt-1">Programas en los que estás inscrito</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-600">Cargando...</div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No estás inscrito en ningún programa</p>
          <button
            onClick={() => router.push('/dashboard/programs')}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium"
          >
            Ver Programas Disponibles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-gradient-to-br from-green-50 to-white p-6 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/dashboard/programs/${enrollment.program?.id}`)}
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {enrollment.program?.name || 'N/A'}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {enrollment.program?.description || 'Sin descripción'}
                </p>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progreso</span>
                  <span className="text-sm font-semibold text-green-700">{enrollment.progress}%</span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full">
                  {enrollment.status}
                </span>
                <span className="text-xs text-gray-500">
                  Inscrito: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

