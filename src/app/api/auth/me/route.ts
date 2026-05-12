import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionUserFromCookie } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const user = getSessionUserFromCookie(token);
  if (!user) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
  }
  return NextResponse.json(user);
}
