import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const isAuth = req.cookies.get('dashboard_auth')?.value === 'authorized';
  const isLogin = req.nextUrl.pathname === '/dashboard/login';

  if (req.nextUrl.pathname.startsWith('/dashboard') && !isLogin && !isAuth) {
    return NextResponse.redirect(new URL('/dashboard/login', req.url));
  }
  if (isLogin && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: '/dashboard/:path*' };
