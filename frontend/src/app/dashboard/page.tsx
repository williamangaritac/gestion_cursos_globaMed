'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchPrograms } from '@/store/slices/programsSlice';
import { fetchEnrollments } from '@/store/slices/enrollmentsSlice';
import { UserRole } from '@/types';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { programs, total: totalPrograms } = useAppSelector((state) => state.programs);
  const { enrollments, total: totalEnrollments } = useAppSelector((state) => state.enrollments);

  useEffect(() => {
    dispatch(fetchPrograms({ page: 1, limit: 5 }));

    if (user?.role === UserRole.STUDENT) {
      dispatch(fetchEnrollments({ userId: user.id, page: 1, limit: 5 }));
    } else {
      dispatch(fetchEnrollments({ page: 1, limit: 5 }));
    }
  }, [dispatch, user]);

  if (!user) {
    return <div className="p-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
          Bienvenido, {user.fullName}
        </h1>
        <p className="text-gray-600 mt-2">Rol: <span className="font-semibold text-green-700">{user.role}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-lg border border-green-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Total Programas</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            {totalPrograms}
          </p>
        </div>

        {user.role === UserRole.STUDENT && (
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Mis Inscripciones</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              {totalEnrollments}
            </p>
          </div>
        )}

        {(user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR) && (
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Total Inscripciones</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              {totalEnrollments}
            </p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Programas Recientes</h2>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
          {programs.slice(0, 5).map((program) => (
            <div key={program.id} className="p-5 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{program.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{program.description || 'Sin descripción'}</p>
                </div>
                <span className="ml-4 px-3 py-1 text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full">
                  {program.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {program.currentStudents}/{program.maxStudents} estudiantes
              </p>
            </div>
          ))}
        </div>
      </div>

      {user.role === UserRole.STUDENT && enrollments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Inscripciones Recientes</h2>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
            {enrollments.slice(0, 5).map((enrollment) => (
              <div key={enrollment.id} className="p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-semibold text-gray-900">{enrollment.program?.name}</p>
                  <span className="ml-4 px-3 py-1 text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-full">
                    {enrollment.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-600 min-w-[100px]">Progreso: {enrollment.progress}%</p>
                  <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

