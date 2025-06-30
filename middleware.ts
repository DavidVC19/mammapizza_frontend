import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('MIDDLEWARE - Detalles de solicitud:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    env: {
      NEXT_PUBLIC_BACK_HOST: process.env.NEXT_PUBLIC_BACK_HOST,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
    }
  });

  return NextResponse.next();
}

// Configurar para ejecutarse en rutas específicas
export const config = {
  matcher: ['/api/:path*']
}; 