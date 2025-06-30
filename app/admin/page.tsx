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

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    error: ''
  });
  const router = useRouter();

  // Depuración de navegación
  useEffect(() => {
    console.log('Configuración inicial de navegación:', {
      pathname: window.location.pathname,
      search: window.location.search
    });
  }, []);

  // Verificación inicial de sesión
  useEffect(() => {
    const checkSession = async () => {
      try {
        const verifyUrl = `${process.env.NEXT_PUBLIC_BACK_HOST}/auth/verify`;
        console.log(`[AdminLogin] Intentando URL de verificación: ${verifyUrl}`);

        const response = await fetch(verifyUrl, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log(`[AdminLogin] Respuesta de verificación:`, {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.ok) {
          const data = await response.json();
          if (data.usuario?.rol === 'admin') {
            console.log('[AdminLogin] Navegando a dashboard');
            router.push('/admin/dashboard');
          }
        }
      } catch (error) {
        console.error('[AdminLogin] Error en verificación de sesión:', error);
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '' });

    try {
      const loginUrls = [
        `/api/auth/login`,
        `${process.env.NEXT_PUBLIC_BACK_HOST}/api/auth/login`,
        `${process.env.NEXT_PUBLIC_BACK_HOST}/auth/login`
      ];

      let successfulLogin = false;
      for (const loginUrl of loginUrls) {
        console.log(`[AdminLogin] Intentando URL de login: ${loginUrl}`);

        try {
          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData),
          });

          console.log(`[AdminLogin] Respuesta de login (${loginUrl}):`, {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
          });

          const responseText = await response.text();
          console.log(`[AdminLogin] Texto de respuesta (${loginUrl}):`, responseText);

          if (response.ok) {
            try {
              const data = JSON.parse(responseText);
              
              if (data.usuario?.rol !== 'admin') {
                throw new Error('Acceso reservado para administradores');
              }

              // Almacenar token como fallback
              if (data.token) {
                localStorage.setItem('authToken', data.token);
              }

              // Navegación programática con depuración
              console.log('[AdminLogin] Login exitoso, navegando a dashboard');
              
              // Intentar navegación múltiple
              router.push('/admin/dashboard');
              window.location.href = '/admin/dashboard';

              successfulLogin = true;
              break;
            } catch (parseError) {
              console.error(`[AdminLogin] Error parseando respuesta (${loginUrl}):`, parseError);
            }
          }
        } catch (fetchError) {
          console.error(`[AdminLogin] Error de fetch (${loginUrl}):`, fetchError);
        }
      }

      if (!successfulLogin) {
        throw new Error('No se pudo iniciar sesión con ninguna URL');
      }
    } catch (error: any) {
      console.error('[AdminLogin] Error completo:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      setStatus({
        loading: false,
        error: error.message || 'Error al iniciar sesión'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#0C1011] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="text-center mb-10">
          <div className="mx-auto w-24 h-24 bg-[#E74C3C]/10 rounded-full flex items-center justify-center mb-6 border border-[#E74C3C]/20">
            <span className="text-4xl text-[#E74C3C]">🔒</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 font-serif">Admin Panel</h2>
          <p className="text-[#95A5A6] text-sm">Inicio de sesión seguro</p>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-[#E74C3C]/40 to-transparent"></div>
        </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {status.error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
            {status.error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-[#ECF0F1] mb-2">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#2C3E50]/30 border border-[#2C3E50] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/50 text-white placeholder-[#95A5A6]"
            placeholder="admin@mammapizza.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#ECF0F1] mb-2">
            Contraseña
          </label>
          <input
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#2C3E50]/30 border border-[#2C3E50] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E74C3C]/50 text-white placeholder-[#95A5A6]"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={status.loading}
          className="w-full bg-gradient-to-r from-[#E74C3C] to-[#C0392B] text-white py-3 px-4 rounded-lg hover:opacity-90 focus:ring-2 focus:ring-[#E74C3C]/50 disabled:opacity-50 transition-all flex justify-center"
        >
          {status.loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </>
          ) : 'Iniciar Sesión'}
        </button>
      </form>
      <div className="mt-8 text-center text-xs text-[#95A5A6]">
          <p>@AdminSystem - 2025</p>
          <div className="mt-2 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse"></div>
            <span>Sistema en línea</span>
          </div>
        </div>
    </div>
  );
}