'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LoginResponse {
  success: boolean;
  message?: string;
  usuario?: {
    id: number;
    email: string;
    rol: string;
  };
  token?: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    error: ''
  });
  const router = useRouter();

  // Verificación inicial de sesión
  useEffect(() => {
    // Comentar temporalmente la verificación de sesión
    // Eliminar cualquier intento de verificación de autenticación
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '' });

    try {
      // Usar URL para construir la URL correctamente
      const backendHost = process.env.NEXT_PUBLIC_BACK_HOST?.replace(/\/+$/, '');
      const loginUrl = `${backendHost}/api/auth/login`;

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.usuario?.rol !== 'admin') {
          throw new Error('Acceso reservado para administradores');
        }

        // Almacenar información del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(data.usuario));

        router.push('/admin/dashboard');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      console.error('[Login] Error completo:', error);
      
      setStatus({
        loading: false,
        error: error.message || 'Error al iniciar sesión'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1011] flex items-center justify-center px-4 relative overflow-hidden">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        {status.error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
            {status.error}
          </div>
        )}
        
        <div className="space-y-4">
          <input
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
            className="w-full px-4 py-3 bg-[#2C3E50]/30 border border-[#2C3E50] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/50 text-white placeholder-[#95A5A6]"
            placeholder="admin@mammapizza.com"
          />
          <input
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
            className="w-full px-4 py-3 bg-[#2C3E50]/30 border border-[#2C3E50] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/50 text-white placeholder-[#95A5A6]"
            placeholder="••••••••"
          />
          <button
            type="submit"
            disabled={status.loading}
            className="w-full bg-gradient-to-r from-[#E74C3C] to-[#C0392B] text-white py-3 px-4 rounded-lg hover:opacity-90 focus:ring-2 focus:ring-[#E74C3C]/50 disabled:opacity-50 transition-all flex justify-center"
          >
            {status.loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>
    </div>
  );
} 