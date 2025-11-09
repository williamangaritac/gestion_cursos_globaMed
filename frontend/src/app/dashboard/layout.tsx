'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { UserRole } from '@/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router, mounted]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/auth/login');
  };

  if (!mounted || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-gray-100">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-green-100">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Gestión de Cursos
              </h1>
              <div className="flex gap-6">
                <Link href="/dashboard" className="text-gray-700 hover:text-green-600 transition">
                  Inicio
                </Link>
                <Link href="/dashboard/programs" className="text-gray-700 hover:text-green-600 transition">
                  Programas
                </Link>
                {user.role === UserRole.STUDENT && (
                  <Link href="/dashboard/my-enrollments" className="text-gray-700 hover:text-green-600 transition">
                    Mis Inscripciones
                  </Link>
                )}
                {(user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR) && (
                  <Link href="/dashboard/enrollments" className="text-gray-700 hover:text-green-600 transition">
                    Inscripciones
                  </Link>
                )}
                {user.role === UserRole.ADMIN && (
                  <Link href="/dashboard/users" className="text-gray-700 hover:text-green-600 transition">
                    Usuarios
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.fullName} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded hover:from-red-700 hover:to-red-800 text-sm transition"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

