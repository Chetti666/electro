import { cookies } from 'next/headers';

interface SessionUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

export function getSessionUserFromCookie(cookieValue: string): SessionUser | null {
  try {
    const decoded = Buffer.from(cookieValue, 'base64').toString('utf-8');
    return JSON.parse(decoded) as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  return getSessionUserFromCookie(token);
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return user;
}
