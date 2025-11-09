'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchEnrollments, updateEnrollmentProgress, createEnrollment, updateEnrollment } from '@/store/slices/enrollmentsSlice';
import { fetchPrograms } from '@/store/slices/programsSlice';
import { fetchUsers } from '@/store/slices/usersSlice';

export default function EnrollmentsPage() {
  const dispatch = useAppDispatch();
  const { enrollments, isLoading } = useAppSelector((state) => state.enrollments);
  const { programs } = useAppSelector((state) => state.programs);
  const { users } = useAppSelector((state) => state.users);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [creating, setCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterProgram, setFilterProgram] = useState<string>('');
  const [searchStudent, setSearchStudent] = useState<string>('');

  useEffect(() => {
    dispatch(fetchEnrollments({ page: 1, limit: 50 }));
    dispatch(fetchPrograms({}));
    dispatch(fetchUsers({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleUpdateProgress = async (id: string, progress: number) => {
    await dispatch(updateEnrollmentProgress({ id, progress }));
    dispatch(fetchEnrollments({ page: 1, limit: 50 }));
  };

  const handleCreateEnrollment = async () => {
    if (!selectedUserId || !selectedProgramId) {
      alert('Por favor selecciona un usuario y un programa');
      return;
    }

    try {
      setCreating(true);
      await dispatch(createEnrollment({
        userId: selectedUserId,
        programId: selectedProgramId,
      })).unwrap();

      alert('Inscripción creada exitosamente');
      setShowCreateModal(false);
      setSelectedUserId('');
      setSelectedProgramId('');
      dispatch(fetchEnrollments({ page: 1, limit: 50 }));
    } catch (error: any) {
      alert(error.message || 'Error al crear la inscripción');
    } finally {
      setCreating(false);
    }
  };

  // Filtrar solo estudiantes
  const students = users.filter(u => u.role === 'STUDENT');

  // Filtrar inscripciones
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesStatus = !filterStatus || enrollment.status === filterStatus;
    const matchesProgram = !filterProgram || enrollment.programId === filterProgram;
    const matchesStudent = !searchStudent ||
      enrollment.user?.fullName?.toLowerCase().includes(searchStudent.toLowerCase()) ||
      enrollment.user?.email?.toLowerCase().includes(searchStudent.toLowerCase());

    return matchesStatus && matchesProgram && matchesStudent;
  });

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            Gestión de Inscripciones
          </h1>
          <p className="text-gray-600 mt-1">Administra y asigna estudiantes a programas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium shadow-md"
        >
          + Asignar Usuario a Curso
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Estudiante
            </label>
            <input
              type="text"
              placeholder="Nombre o email..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Programa
            </label>
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos los programas</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="DROPPED">DROPPED</option>
            </select>
          </div>
        </div>

        {(searchStudent || filterProgram || filterStatus) && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {filteredEnrollments.length} de {enrollments.length} inscripciones
            </p>
            <button
              onClick={() => {
                setSearchStudent('');
                setFilterProgram('');
                setFilterStatus('');
              }}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-600">Cargando...</div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 text-5xl mb-4">📚</div>
          <p className="text-gray-500 font-medium">
            {enrollments.length === 0
              ? 'No hay inscripciones registradas'
              : 'No se encontraron inscripciones con los filtros aplicados'}
          </p>
          {enrollments.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium"
            >
              Crear Primera Inscripción
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-50 to-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Programa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fecha Inscripción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {enrollment.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-gray-900">{enrollment.user?.fullName || 'N/A'}</div>
                          <div className="text-sm text-gray-600">{enrollment.user?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{enrollment.program?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-600">
                        {enrollment.program?.status && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            enrollment.program.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            enrollment.program.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {enrollment.program.status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        enrollment.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' :
                        enrollment.status === 'COMPLETED' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800' :
                        enrollment.status === 'PENDING' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' :
                        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden max-w-[200px]">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 font-medium min-w-[45px]">{enrollment.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(enrollment.enrolledAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen */}
          <div className="bg-gradient-to-r from-green-50 to-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Total de inscripciones: <span className="font-semibold text-gray-900">{filteredEnrollments.length}</span>
              </span>
              <div className="flex gap-4">
                <span className="text-gray-600">
                  Activas: <span className="font-semibold text-green-600">
                    {filteredEnrollments.filter(e => e.status === 'ACTIVE').length}
                  </span>
                </span>
                <span className="text-gray-600">
                  Completadas: <span className="font-semibold text-blue-600">
                    {filteredEnrollments.filter(e => e.status === 'COMPLETED').length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear inscripción */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">
                Asignar Estudiante a Programa
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Selecciona un estudiante y un programa para crear la inscripción
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estudiante <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                >
                  <option value="">-- Selecciona un estudiante --</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.fullName} - {student.email}
                    </option>
                  ))}
                </select>
                {students.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">⚠️ No hay estudiantes disponibles</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Programa <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                >
                  <option value="">-- Selecciona un programa --</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name} - {program.status}
                    </option>
                  ))}
                </select>
                {programs.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">⚠️ No hay programas disponibles</p>
                )}
              </div>

              {/* Información del programa seleccionado */}
              {selectedProgramId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-800 mb-2">📋 Información del Programa</h3>
                  {(() => {
                    const selectedProgram = programs.find(p => p.id === selectedProgramId);
                    if (!selectedProgram) return null;

                    return (
                      <div className="space-y-1 text-sm text-gray-700">
                        <p><span className="font-medium">Nombre:</span> {selectedProgram.name}</p>
                        <p><span className="font-medium">Estado:</span> {selectedProgram.status}</p>
                        <p><span className="font-medium">Capacidad:</span> {selectedProgram.currentStudents || 0} / {selectedProgram.maxStudents}</p>
                        {selectedProgram.startDate && (
                          <p><span className="font-medium">Inicio:</span> {new Date(selectedProgram.startDate).toLocaleDateString('es-ES')}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Información del estudiante seleccionado */}
              {selectedUserId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">👤 Información del Estudiante</h3>
                  {(() => {
                    const selectedStudent = students.find(s => s.id === selectedUserId);
                    if (!selectedStudent) return null;

                    return (
                      <div className="space-y-1 text-sm text-gray-700">
                        <p><span className="font-medium">Nombre:</span> {selectedStudent.fullName}</p>
                        <p><span className="font-medium">Email:</span> {selectedStudent.email}</p>
                        <p><span className="font-medium">Estado:</span> {selectedStudent.status}</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedUserId('');
                  setSelectedProgramId('');
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateEnrollment}
                disabled={creating || !selectedUserId || !selectedProgramId}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-md"
              >
                {creating ? '⏳ Creando...' : '✓ Asignar Inscripción'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

