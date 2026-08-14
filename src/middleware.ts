import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Only protect dashboard and api routes
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.startsWith('/api/auth');

  if (!isDashboardRoute && !isApiRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const payload = await decrypt(token);
    
    // Role-Based Access Control
    if (payload.role === 'STAFF') {
      const path = request.nextUrl.pathname;
      
      // Allowed API routes for STAFF
      const isAllowedApi = path === '/api/attendance/scan' || 
                           (path === '/api/sessions' && request.method === 'GET') || 
                           path === '/api/auth/logout' ||
                           path === '/api/auth/me';
                           
      if (isApiRoute && !isAllowedApi) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Allowed Dashboard routes for STAFF
      if (isDashboardRoute && path !== '/dashboard/scanner') {
        return NextResponse.redirect(new URL('/dashboard/scanner', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
