import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createFlowPayment } from '@/lib/flow';
import {
  createCommerceOrder,
  getSiteUrl,
} from '@/lib/donations';
import {
  DONATION_MAX_AMOUNT,
  DONATION_MIN_AMOUNT,
  isValidDonationAmount,
} from '@/lib/donation-config';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function optionalText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    const amount = Number(body?.amount);
    const email =
      typeof body?.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';

    if (!isValidDonationAmount(amount)) {
      return NextResponse.json(
        {
          error: `El monto debe ser un entero entre $${DONATION_MIN_AMOUNT.toLocaleString('es-CL')} y $${DONATION_MAX_AMOUNT.toLocaleString('es-CL')}.`,
        },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email) || email.length > 160) {
      return NextResponse.json(
        { error: 'Ingresa un correo electrónico válido.' },
        { status: 400 }
      );
    }

    const name = optionalText(body?.name, 80);
    const message = optionalText(body?.message, 300);
    const user = await getCurrentUser();
    const siteUrl = getSiteUrl(new URL(request.url).origin);

    const donation = await prisma.donation.create({
      data: {
        commerceOrder: createCommerceOrder(),
        amount,
        email,
        name,
        message,
        userId: user?.id ?? null,
      },
    });

    try {
      const payment = await createFlowPayment({
        commerceOrder: donation.commerceOrder,
        subject: 'Donación a VMElectric',
        amount,
        email,
        urlConfirmation: `${siteUrl}/api/donations/confirm`,
        urlReturn: `${siteUrl}/api/donations/return`,
        optional: JSON.stringify({
          donationId: donation.id,
          userId: user?.id ?? null,
        }),
      });

      await prisma.donation.update({
        where: { id: donation.id },
        data: {
          token: payment.token,
          flowOrder: payment.flowOrder,
        },
      });

      return NextResponse.json({
        url: payment.url,
        token: payment.token,
      });
    } catch (error) {
      console.error('Error creando la orden de pago en Flow:', error);

      await prisma.donation
        .update({
          where: { id: donation.id },
          data: { status: 'CANCELLED' },
        })
        .catch(() => undefined);

      return NextResponse.json(
        {
          error:
            'No pudimos iniciar el pago con Flow. Revisa la configuración e intenta nuevamente.',
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error inesperado al crear la donación:', error);
    return NextResponse.json(
      { error: 'No se pudo procesar la donación.' },
      { status: 500 }
    );
  }
}
