import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/dashboard/login', req.url));
  res.cookies.delete('dashboard_auth');
  return res;
}
