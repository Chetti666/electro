import { NextResponse } from 'next/server';
import { getSiteUrl, syncDonationStatus } from '@/lib/donations';

function buildThanksUrl(origin: string, token: string | null): URL {
  const url = new URL('/donar/gracias', getSiteUrl(origin));
  if (token) {
    url.searchParams.set('token', token);
  }
  return url;
}

/**
 * Flow redirects the payer's browser here with a POST and `token` in the body.
 * Sync the status and send the user to a normal GET page.
 */
export async function POST(request: Request) {
  let token: string | null = null;

  try {
    const formData = await request.formData();
    const value = formData.get('token');
    token = typeof value === 'string' ? value : null;
  } catch {
    // Redirect to the generic page if the body cannot be parsed.
  }

  if (token) {
    try {
      await syncDonationStatus(token);
    } catch (error) {
      // The thanks page will retry the lookup; never block the redirect.
      console.error('No se pudo sincronizar la donación al volver de Flow:', error);
    }
  }

  return NextResponse.redirect(
    buildThanksUrl(new URL(request.url).origin, token),
    303
  );
}

export async function GET(request: Request) {
  return NextResponse.redirect(
    new URL('/donar', getSiteUrl(new URL(request.url).origin)),
    303
  );
}
