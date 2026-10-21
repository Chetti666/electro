import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Heart, TrendingUp, Clock3, CheckCircle2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getSessionUserFromCookie } from '@/lib/auth';
import type { DonationStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const STATUS_META: Record<
  DonationStatus,
  { label: string; color: string; background: string; border: string }
> = {
  PAID: {
    label: 'Pagada',
    color: 'var(--success)',
    background: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  PENDING: {
    label: 'Pendiente',
    color: 'var(--warning)',
    background: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  },
  REJECTED: {
    label: 'Rechazada',
    color: 'var(--danger)',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  CANCELLED: {
    label: 'Anulada',
    color: 'var(--foreground-muted)',
    background: 'rgba(148, 163, 184, 0.12)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
  },
};

export default async function AdminDonationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  const user = token ? getSessionUserFromCookie(token) : null;

  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/panel');

  const [donations, paidTotals, paidCount, pendingCount] = await Promise.all([
    prisma.donation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.donation.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    }),
    prisma.donation.count({ where: { status: 'PAID' } }),
    prisma.donation.count({ where: { status: 'PENDING' } }),
  ]);

  const totalCollected = paidTotals._sum.amount ?? 0;

  const stats = [
    {
      label: 'Total recaudado',
      value: currencyFormatter.format(totalCollected),
      icon: TrendingUp,
      color: 'var(--success)',
    },
    {
      label: 'Donaciones pagadas',
      value: paidCount.toString(),
      icon: CheckCircle2,
      color: 'var(--primary-light)',
    },
    {
      label: 'Pendientes',
      value: pendingCount.toString(),
      icon: Clock3,
      color: 'var(--warning)',
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-2xl mb-2 font-bold"
            style={{
              fontFamily: 'var(--font-rajdhani)',
              color: 'var(--foreground)',
              letterSpacing: '1px',
            }}
          >
            Donaciones
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Aportes recibidos mediante Flow. Los estados se actualizan con la confirmación de pago.
          </p>
        </div>

        <Link
          href="/donar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shrink-0"
          style={{
            color: '#fda4af',
            background: 'rgba(251, 113, 133, 0.08)',
            border: '1px solid rgba(251, 113, 133, 0.3)',
          }}
        >
          <Heart className="w-4 h-4" />
          Ver página
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg p-5 card">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {stat.label}
              </span>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: stat.color, fontFamily: 'var(--font-rajdhani)' }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg p-5 card">
        {donations.length === 0 ? (
          <div className="text-center py-12">
            <Heart
              className="w-10 h-10 mx-auto mb-4"
              style={{ color: 'var(--foreground-dim)' }}
            />
            <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
              Todavía no hay donaciones
            </p>
            <p className="text-sm" style={{ color: 'var(--foreground-dim)' }}>
              Cuando alguien done mediante Flow, la transacción aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['Fecha', 'Donante', 'Email', 'Monto', 'Estado', 'Orden Flow'].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 font-semibold whitespace-nowrap"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => {
                  const status = STATUS_META[donation.status];
                  return (
                    <tr
                      key={donation.id}
                      style={{ borderBottom: '1px solid var(--card-border)' }}
                    >
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{ color: 'var(--foreground-dim)' }}
                      >
                        {dateFormatter.format(donation.createdAt)}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--foreground)' }}>
                        <div className="font-medium">
                          {donation.name || 'Anónimo'}
                        </div>
                        {donation.message && (
                          <div
                            className="text-xs mt-1 max-w-xs truncate"
                            style={{ color: 'var(--foreground-dim)' }}
                            title={donation.message}
                          >
                            {donation.message}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--foreground-muted)' }}>
                        {donation.email}
                      </td>
                      <td
                        className="px-4 py-3 font-semibold whitespace-nowrap"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {currencyFormatter.format(donation.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="badge"
                          style={{
                            color: status.color,
                            background: status.background,
                            border: status.border,
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{ color: 'var(--foreground-dim)' }}
                      >
                        {donation.flowOrder ? `#${donation.flowOrder}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs" style={{ color: 'var(--foreground-dim)' }}>
        Mostrando las últimas 200 donaciones. Puedes reenviar la confirmación desde el panel de Flow si un pago quedó pendiente.
      </p>
    </div>
  );
}
