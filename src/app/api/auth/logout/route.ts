import { NextResponse } from 'next/server';
import { sessionCookieOptions } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('session_token', '', {
    ...sessionCookieOptions,
    maxAge: 0,
  });
  return response;
}
