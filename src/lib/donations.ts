import crypto from 'node:crypto';
import { DonationStatus, Prisma, type Donation } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getFlowPaymentStatus } from '@/lib/flow';

const FLOW_STATUS_TO_DONATION: Record<number, DonationStatus> = {
  1: DonationStatus.PENDING,
  2: DonationStatus.PAID,
  3: DonationStatus.REJECTED,
  4: DonationStatus.CANCELLED,
};

export function createCommerceOrder(): string {
  return `DON-${crypto.randomUUID()}`;
}

export function getSiteUrl(fallbackOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configured || fallbackOrigin || 'https://vmelectric.cl').replace(
    /\/+$/,
    ''
  );
}

/**
 * Reads the authoritative status from Flow and persists it. Safe to call from
 * both the webhook and the return page (the operation is idempotent).
 */
export async function syncDonationStatus(
  token: string
): Promise<Donation | null> {
  const donation = await prisma.donation.findUnique({ where: { token } });

  if (!donation) {
    return null;
  }

  const payment = await getFlowPaymentStatus(token);

  if (payment.commerceOrder !== donation.commerceOrder) {
    throw new Error(
      `La orden de Flow (${payment.commerceOrder}) no coincide con la donación (${donation.commerceOrder}).`
    );
  }

  const paidAmount = Math.round(Number(payment.amount));
  if (!Number.isFinite(paidAmount) || paidAmount !== donation.amount) {
    throw new Error(
      `El monto informado por Flow (${payment.amount}) no coincide con la donación (${donation.amount}).`
    );
  }

  return prisma.donation.update({
    where: { id: donation.id },
    data: {
      status: FLOW_STATUS_TO_DONATION[payment.status] ?? DonationStatus.PENDING,
      flowOrder: payment.flowOrder,
      payer: payment.payer || null,
      paymentData: payment.paymentData
        ? (payment.paymentData as Prisma.InputJsonValue)
        : undefined,
    },
  });
}
