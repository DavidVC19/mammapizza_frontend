'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificación simple basada en localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.rol === 'admin') {
        setIsAuthenticated(true);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthenticated) {
    return null; // O un componente de carga
  }

  return <>{children}</>;
}