'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: number;
  email: string;
  rol: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  usuario?: Usuario;
}

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<Usuario | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async (): Promise<void> => {
      try {
        // Intentar primero con cookies
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACK_HOST}api/auth/verify`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Si falla con cookies, intentar con token en localStorage (fallback para producción)
        if (!response.ok) {
          const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
          if (token) {
            response = await fetch(`${process.env.NEXT_PUBLIC_BACK_HOST}api/auth/verify`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
          }
        }

        if (response.ok) {
          const data: AuthResponse = await response.json();
          if (data.success && data.usuario?.rol === 'admin') {
            setIsAuthenticated(true);
            setUser(data.usuario);
          } else {
            // Limpiar localStorage si el usuario no es admin
            if (typeof window !== 'undefined') {
              localStorage.removeItem('authToken');
            }
            router.push('/admin');
          }
        } else {
          // Limpiar localStorage si la respuesta no es exitosa
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
          }
          router.push('/admin');
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        // Limpiar localStorage en caso de error
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}