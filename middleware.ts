import { NextResponse, type NextRequest } from 'next/server';

/**
 * Portón simple: sin la cookie de acceso, todo va a /acceso.
 * Es un candado de estudio, no una bóveda — ver la nota de RLS en schema.sql.
 */
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/acceso')) return NextResponse.next();
  if (req.cookies.get('un_acceso')?.value === '1') return NextResponse.next();
  return NextResponse.redirect(new URL('/acceso', req.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
