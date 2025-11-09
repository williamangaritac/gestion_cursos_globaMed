'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchPrograms, deleteProgram } from '@/store/slices/programsSlice';
import { UserRole, ProgramStatus } from '@/types';

export default function ProgramsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { programs, total, page, limit, isLoading } = useAppSelector((state) => state.programs);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProgramStatus | ''>('');

  useEffect(() => {
    dispatch(
      fetchPrograms({
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      })
    );
  }, [dispatch, currentPage, limit, searchTerm, statusFilter]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este programa?')) {
      await dispatch(deleteProgram(id));
      dispatch(fetchPrograms({ page: currentPage, limit }));
    }
  };

  const totalPages = Math.ceil(total / limit);
  const canCreateProgram = user?.role === UserRole.ADMIN || user?.role === UserRole.INSTRUCTOR;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            Programas
          </h1>
          <p className="text-gray-600 mt-1">Lista de todos los programas disponibles</p>
        </div>
        {canCreateProgram && (
          <button
            onClick={() => router.push('/dashboard/programs/create')}
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium"
          >
            Crear Programa
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o descripción..."
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProgramStatus | '')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Todos los Estados</option>
          <option value={ProgramStatus.DRAFT}>Borrador</option>
          <option value={ProgramStatus.PUBLISHED}>Publicado</option>
          <option value={ProgramStatus.ACTIVE}>Activo</option>
          <option value={ProgramStatus.COMPLETED}>Completado</option>
          <option value={ProgramStatus.ARCHIVED}>Archivado</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-600">Cargando...</div>
      ) : programs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No se encontraron programas</div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-50 to-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estudiantes</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fechas</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {programs.map((program) => (
                  <tr key={program.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{program.name}</div>
                      <div className="text-sm text-gray-600">{program.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full">
                        {program.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {program.currentStudents}/{program.maxStudents}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-3">
                      <button
                        onClick={() => router.push(`/dashboard/programs/${program.id}`)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Ver
                      </button>
                      {canCreateProgram && (
                        <>
                          <button
                            onClick={() => router.push(`/dashboard/programs/${program.id}/edit`)}
                            className="text-gray-600 hover:text-gray-800 font-medium"
                          >
                            Editar
                          </button>
                          {user?.role === UserRole.ADMIN && (
                            <button
                              onClick={() => handleDelete(program.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Eliminar
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-gray-700 font-medium">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

