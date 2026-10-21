import { NextResponse } from 'next/server';
import { syncDonationStatus } from '@/lib/donations';

/**
 * Flow calls this endpoint server-to-server after a payment attempt.
 * It must answer 200 in under 15 seconds. The operation is idempotent.
 */
export async function POST(request: Request) {
  let token: string | null = null;

  try {
    const formData = await request.formData();
    const value = formData.get('token');
    token = typeof value === 'string' ? value : null;
  } catch (error) {
    console.error('Confirmación de Flow sin cuerpo válido:', error);
    return new NextResponse('Solicitud inválida', { status: 400 });
  }

  if (!token) {
    return new NextResponse('Token requerido', { status: 400 });
  }

  try {
    const donation = await syncDonationStatus(token);

    if (!donation) {
      console.warn(`Confirmación de Flow para un token desconocido: ${token}`);
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error sincronizando la donación con Flow:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
