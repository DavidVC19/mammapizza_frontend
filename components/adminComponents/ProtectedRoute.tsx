'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthResponse {
  success: boolean;
  message?: string;
  usuario?: {
    id: number;
    email: string;
    rol: string;
  };
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  useEffect(() => {
    const verifyAuth = async () => {
      console.log('[ProtectedRoute] Iniciando verificación de autenticación');
      
      try {
        // Intento con cookies primero
        let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/auth/verify`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('[ProtectedRoute] Respuesta inicial:', response.status);

        // Fallback: intentar con token en localStorage si falla con cookies
        if (!response.ok) {
          const token = localStorage.getItem('authToken');
          if (token) {
            console.log('[ProtectedRoute] Intentando con token de localStorage');
            response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/auth/verify`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
          }
        }

        const data: AuthResponse = await response.json();
        console.log('[ProtectedRoute] Datos de verificación:', data);

        if (response.ok && data.success && data.usuario?.rol === 'admin') {
          console.log('[ProtectedRoute] Usuario autenticado:', data.usuario.email);
          setAuthState('authenticated');
        } else {
          throw new Error(data.message || 'No autorizado');
        }
      } catch (error) {
        console.error('[ProtectedRoute] Error de autenticación:', error);
        localStorage.removeItem('authToken');
        setAuthState('unauthenticated');
        router.push('/admin');
      }
    };

    verifyAuth();
  }, [router]);

  if (authState === 'checking') {
    console.log('[ProtectedRoute] Mostrando loader durante verificación');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (authState === 'authenticated') {
    console.log('[ProtectedRoute] Renderizando contenido protegido');
    return <>{children}</>;
  }

  return null;
}