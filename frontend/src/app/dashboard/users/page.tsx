'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchUsers, deleteUser, createUser } from '@/store/slices/usersSlice';

export default function UsersManagementPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { users, isLoading } = useAppSelector((state) => state.users);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  // Estados para el modal de crear usuario
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'STUDENT' as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Estados para filtros
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 50 }));
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      await dispatch(deleteUser(id));
      dispatch(fetchUsers({ page: 1, limit: 50 }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.fullName.trim()) {
      errors.fullName = 'El nombre completo es requerido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setCreating(true);
      await dispatch(createUser(formData)).unwrap();

      alert('✅ Usuario creado exitosamente');
      setShowCreateModal(false);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        role: 'STUDENT',
      });
      setFormErrors({});
      dispatch(fetchUsers({ page: 1, limit: 50 }));
    } catch (error: any) {
      alert(`❌ Error al crear usuario: ${error.message || 'Error desconocido'}`);
    } finally {
      setCreating(false);
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    const matchesSearch = !searchTerm ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">Administra todos los usuarios del sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium shadow-md"
        >
          + Crear Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Usuario
            </label>
            <input
              type="text"
              placeholder="Nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Rol
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="INSTRUCTOR">INSTRUCTOR</option>
              <option value="STUDENT">STUDENT</option>
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
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </div>

        {(searchTerm || filterRole || filterStatus) && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRole('');
                setFilterStatus('');
              }}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla de usuarios */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-600">Cargando...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 text-5xl mb-4">👥</div>
          <p className="text-gray-500 font-medium">
            {users.length === 0
              ? 'No hay usuarios registrados'
              : 'No se encontraron usuarios con los filtros aplicados'}
          </p>
          {users.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium"
            >
              Crear Primer Usuario
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-50 to-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-gray-900">{user.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800' :
                        user.role === 'INSTRUCTOR' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800' :
                        'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.status === 'ACTIVE'
                          ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                          : user.status === 'SUSPENDED'
                          ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                      {currentUser?.id !== user.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-800 font-medium transition"
                        >
                          🗑️ Eliminar
                        </button>
                      )}
                      {currentUser?.id === user.id && (
                        <span className="text-gray-400 text-xs">Tú</span>
                      )}
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
                Total de usuarios: <span className="font-semibold text-gray-900">{filteredUsers.length}</span>
              </span>
              <div className="flex gap-4">
                <span className="text-gray-600">
                  Admins: <span className="font-semibold text-purple-600">
                    {filteredUsers.filter(u => u.role === 'ADMIN').length}
                  </span>
                </span>
                <span className="text-gray-600">
                  Instructores: <span className="font-semibold text-blue-600">
                    {filteredUsers.filter(u => u.role === 'INSTRUCTOR').length}
                  </span>
                </span>
                <span className="text-gray-600">
                  Estudiantes: <span className="font-semibold text-green-600">
                    {filteredUsers.filter(u => u.role === 'STUDENT').length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">
                Crear Nuevo Usuario
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Completa los datos para crear un nuevo usuario en el sistema
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Nombre Completo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.fullName && (
                  <p className="text-sm text-red-600 mt-1">⚠️ {formErrors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ej: juan.perez@example.com"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">⚠️ {formErrors.email}</p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.password && (
                  <p className="text-sm text-red-600 mt-1">⚠️ {formErrors.password}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  💡 La contraseña debe tener al menos 8 caracteres
                </p>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                >
                  <option value="STUDENT">STUDENT - Estudiante</option>
                  <option value="INSTRUCTOR">INSTRUCTOR - Instructor</option>
                  <option value="ADMIN">ADMIN - Administrador</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.role === 'ADMIN' && '👑 Acceso completo al sistema'}
                  {formData.role === 'INSTRUCTOR' && '👨‍🏫 Puede gestionar programas e inscripciones'}
                  {formData.role === 'STUDENT' && '🎓 Puede inscribirse en programas'}
                </p>
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Información</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• El usuario recibirá las credenciales por email</li>
                  <li>• El estado inicial será ACTIVE</li>
                  <li>• Podrá cambiar su contraseña después del primer login</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    email: '',
                    password: '',
                    fullName: '',
                    role: 'STUDENT',
                  });
                  setFormErrors({});
                }}
                disabled={creating}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-md"
              >
                {creating ? '⏳ Creando...' : '✓ Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

