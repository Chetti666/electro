import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  CALCULATION_LABELS,
  CALCULATION_TYPE_VALUES,
  isCalculationType,
} from '@/lib/calculation-types';
import { formatCalculationSummary } from '@/lib/calculation-format';
import CalculationHistoryList from '@/components/panel/CalculationHistoryList';

export default async function PanelHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'ADMIN') redirect('/admin');

  const { tipo } = await searchParams;
  const selectedType = tipo && isCalculationType(tipo) ? tipo : null;

  const calculations = await prisma.calculation.findMany({
    where: {
      userId: user.id,
      ...(selectedType ? { type: selectedType } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const items = calculations.map((calculation) => {
    const summary = formatCalculationSummary(
      calculation.type,
      calculation.input,
      calculation.result
    );
    return {
      id: calculation.id,
      type: calculation.type,
      title: calculation.title,
      createdAt: calculation.createdAt.toISOString(),
      inputs: summary.inputs,
      result: summary.result,
    };
  });

  return (
    <div>
      <h1
        className="text-2xl mb-2 font-bold"
        style={{
          fontFamily: 'var(--font-rajdhani)',
          color: 'var(--foreground)',
          letterSpacing: '1px',
        }}
      >
        Historial de cálculos
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
        Los cálculos que realizas con tu sesión iniciada se guardan automáticamente.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/panel/historial"
          className="px-3 py-1.5 rounded-full text-xs font-medium"
          style={
            !selectedType
              ? {
                  background: 'rgba(37, 99, 235, 0.15)',
                  border: '1px solid rgba(37, 99, 235, 0.35)',
                  color: 'var(--primary-light)',
                }
              : {
                  border: '1px solid var(--card-border)',
                  color: 'var(--foreground-muted)',
                }
          }
        >
          Todos
        </Link>
        {CALCULATION_TYPE_VALUES.map((type) => (
          <Link
            key={type}
            href={`/panel/historial?tipo=${type}`}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={
              selectedType === type
                ? {
                    background: 'rgba(37, 99, 235, 0.15)',
                    border: '1px solid rgba(37, 99, 235, 0.35)',
                    color: 'var(--primary-light)',
                  }
                : {
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground-muted)',
                  }
            }
          >
            {CALCULATION_LABELS[type]}
          </Link>
        ))}
      </div>

      <CalculationHistoryList items={items} />
    </div>
  );
}
