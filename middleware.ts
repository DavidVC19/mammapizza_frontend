import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Logging detallado de solicitudes
  console.log('MIDDLEWARE - Detalles de solicitud:', {
    url: request.url,
    method: request.method,
    pathname: new URL(request.url).pathname,
    headers: Object.fromEntries(request.headers.entries()),
    cookies: request.cookies.getAll(),
    env: {
      NEXT_PUBLIC_BACK_HOST: process.env.NEXT_PUBLIC_BACK_HOST,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
    }
  });

  // Reescritura de rutas para debugging
  const url = new URL(request.url);
  
  // Manejo de rutas de autenticación
  if (url.pathname.startsWith('/api/auth/')) {
    const backendUrl = process.env.NEXT_PUBLIC_BACK_HOST || '';
    const newUrl = new URL(url.pathname.replace('/api/', '/'), backendUrl);
    
    console.log('MIDDLEWARE - Reescritura de URL de autenticación:', {
      originalUrl: url.toString(),
      newUrl: newUrl.toString()
    });

    return NextResponse.rewrite(newUrl);
  }

  // Protección de rutas de admin
  if (url.pathname.startsWith('/admin/')) {
    const token = request.cookies.get('authToken');
    
    console.log('MIDDLEWARE - Verificación de ruta de admin:', {
      token: !!token,
      pathname: url.pathname
    });

    if (!token) {
      console.log('MIDDLEWARE - Redirigiendo a login por falta de token');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configurar para ejecutarse en rutas específicas
export const config = {
  matcher: ['/api/:path*', '/admin/:path*']
}; 