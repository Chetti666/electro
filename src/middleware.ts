import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('session_token'); // Asume que tienes una cookie de sesión

  const protectedPaths = ['/calculadoras', '/informes', '/signup']; // Rutas que requieren autenticación

  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
