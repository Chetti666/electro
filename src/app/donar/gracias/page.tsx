import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Heart,
  RotateCw,
} from 'lucide-react';
import type { Donation } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { syncDonationStatus } from '@/lib/donations';

export const metadata: Metadata = {
  title: 'Gracias por tu donación | VMElectric',
  robots: {
    index: false,
    follow: false,
  },
};

const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'long',
  timeStyle: 'short',
});

function formatCLP(value: number): string {
  return currencyFormatter.format(value);
}

function getStatusView(donation: Donation | null) {
  if (!donation) {
    return {
      icon: Heart,
      color: 'var(--foreground-muted)',
      border: 'rgba(148, 163, 184, 0.35)',
      title: 'No encontramos esta donación',
      description:
        'El enlace puede haber expirado o el pago no llegó a iniciarse. Si ya pagaste, escríbenos y lo revisamos.',
    };
  }

  if (donation.status === 'PAID') {
    return {
      icon: CheckCircle2,
      color: 'var(--success)',
      border: 'rgba(34, 197, 94, 0.35)',
      title: '¡Gracias por tu donación!',
      description:
        'Tu aporte ya fue confirmado por Flow y nos ayuda a mantener las herramientas gratuitas para todos.',
    };
  }

  if (donation.status === 'PENDING') {
    return {
      icon: Clock3,
      color: 'var(--warning)',
      border: 'rgba(245, 158, 11, 0.35)',
      title: 'Tu donación está pendiente',
      description:
        'Flow todavía no confirma el pago. Si elegiste un medio de pago en efectivo, la confirmación puede tardar algunas horas.',
    };
  }

  return {
    icon: AlertCircle,
    color: 'var(--danger)',
    border: 'rgba(239, 68, 68, 0.35)',
    title: 'La donación no se completó',
    description:
      'Flow rechazó o anuló la transacción. No se realizó ningún cobro; puedes intentarlo nuevamente cuando quieras.',
  };
}

export default async function DonationThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let donation: Donation | null = token
    ? await prisma.donation.findUnique({ where: { token } })
    : null;

  if (donation && token) {
    try {
      donation = (await syncDonationStatus(token)) ?? donation;
    } catch (error) {
      console.error('No se pudo actualizar el estado de la donación:', error);
    }
  }

  const view = getStatusView(donation);
  const StatusIcon = view.icon;

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(700px 360px at 50% -5%, rgba(37, 99, 235, 0.14), transparent 70%)',
        }}
      />

      <div className="page-container relative">
        <div className="max-w-xl mx-auto">
          <div className="rounded-2xl p-8 md:p-10 text-center card">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${view.border}`,
              }}
            >
              <StatusIcon className="w-8 h-8" style={{ color: view.color }} />
            </div>

            <h1
              className="text-2xl md:text-3xl font-bold mb-3"
              style={{
                fontFamily: 'var(--font-rajdhani)',
                color: 'var(--foreground)',
                letterSpacing: '0.5px',
              }}
            >
              {view.title}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
              {view.description}
            </p>

            {donation && (
              <div
                className="mt-8 rounded-xl p-5 text-left space-y-3"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--foreground-dim)' }}>
                    Monto
                  </span>
                  <span
                    className="text-xl font-bold"
                    style={{ fontFamily: 'var(--font-rajdhani)', color: 'var(--foreground)' }}
                  >
                    {formatCLP(donation.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--foreground-dim)' }}>
                    Correo
                  </span>
                  <span className="truncate" style={{ color: 'var(--foreground-muted)' }}>
                    {donation.email}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--foreground-dim)' }}>
                    Fecha
                  </span>
                  <span style={{ color: 'var(--foreground-muted)' }}>
                    {dateFormatter.format(donation.createdAt)}
                  </span>
                </div>

                {donation.flowOrder && (
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--foreground-dim)' }}>
                      Orden Flow
                    </span>
                    <span style={{ color: 'var(--foreground-muted)' }}>
                      #{donation.flowOrder}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              {donation?.status === 'PENDING' && token ? (
                <Link
                  href={`/donar/gracias?token=${encodeURIComponent(token)}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold"
                  style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: 'var(--warning)',
                  }}
                >
                  <RotateCw className="w-4 h-4" />
                  Actualizar estado
                </Link>
              ) : donation && donation.status !== 'PAID' ? (
                <Link
                  href="/donar"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold"
                  style={{
                    background: 'rgba(37, 99, 235, 0.12)',
                    border: '1px solid rgba(37, 99, 235, 0.35)',
                    color: 'var(--primary-light)',
                  }}
                >
                  <Heart className="w-4 h-4" />
                  Intentar nuevamente
                </Link>
              ) : (
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold"
                  style={{
                    background: 'rgba(37, 99, 235, 0.12)',
                    border: '1px solid rgba(37, 99, 235, 0.35)',
                    color: 'var(--primary-light)',
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio
                </Link>
              )}

              <Link
                href="/calculadoras"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--card-border)',
                  color: 'var(--foreground-muted)',
                }}
              >
                Ir a las calculadoras
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs" style={{ color: 'var(--foreground-dim)' }}>
            ¿Tienes problemas con tu donación?{' '}
            <Link href="/contact" className="underline hover:text-primary-light transition-colors">
              Contáctanos
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
