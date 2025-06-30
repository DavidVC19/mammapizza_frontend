import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Solo proteger rutas admin (excepto la página de login)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const token = request.cookies.get('authToken');
    
    // Si no hay token en cookies, redirigir al login
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    // Excluir archivos estáticos
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};