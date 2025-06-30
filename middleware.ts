import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Logging detallado de solicitudes
  console.log('MIDDLEWARE - Detalles de solicitud:', {
    url: request.url,
    method: request.method,
    pathname: pathname,
    cookies: request.cookies.getAll(),
    env: {
      NEXT_PUBLIC_BACK_HOST: process.env.NEXT_PUBLIC_BACK_HOST,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
    }
  });

  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/admin', '/login'];
  
  // Protección de rutas admin
  if (pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('authToken');
    
    console.log('MIDDLEWARE - Verificación de ruta de admin:', {
      token: !!token,
      pathname: pathname
    });

    if (!token) {
      console.log('MIDDLEWARE - Redirigiendo a login por falta de token');
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Manejo de rutas de autenticación
  if (pathname.startsWith('/api/auth/')) {
    const backendUrl = process.env.NEXT_PUBLIC_BACK_HOST || '';
    const newUrl = new URL(pathname.replace('/api/', '/'), backendUrl);
    
    console.log('MIDDLEWARE - Reescritura de URL de autenticación:', {
      originalUrl: request.url,
      newUrl: newUrl.toString()
    });

    return NextResponse.rewrite(newUrl);
  }

  return NextResponse.next();
}

// Configurar para ejecutarse en rutas específicas
export const config = {
  matcher: ['/admin/:path*', '/api/auth/:path*']
}; 