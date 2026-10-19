import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  CALCULATION_HREFS,
  CALCULATION_LABELS,
} from '@/lib/calculation-types';
import { formatCalculationSummary } from '@/lib/calculation-format';
import { getReportHref, REPORT_TYPE_META } from '@/lib/report-types';

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export default async function PanelDashboard() {
  const user = await getCurrentUser();

  if (!user) redirect('/login');
  if (user.role === 'ADMIN') redirect('/admin');

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [calculationCount, reportCount, monthCalculationCount, recentCalculations, recentReports] =
    await Promise.all([
      prisma.calculation.count({ where: { userId: user.id } }),
      prisma.savedReport.count({ where: { userId: user.id } }),
      prisma.calculation.count({
        where: { userId: user.id, createdAt: { gte: startOfMonth } },
      }),
      prisma.calculation.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.savedReport.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          title: true,
          clientName: true,
          updatedAt: true,
        },
      }),
    ]);

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
        Mi Panel de Cliente
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--foreground-muted)' }}>
        Bienvenido, {user.name || user.email}. Aquí tienes tus cálculos e informes guardados.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Cálculos guardados', value: calculationCount, color: 'var(--primary-light)' },
          { label: 'Informes guardados', value: reportCount, color: 'var(--success)' },
          { label: 'Cálculos este mes', value: monthCalculationCount, color: 'var(--secondary)' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg p-5 text-center card">
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: stat.color, fontFamily: 'var(--font-rajdhani)' }}
            >
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-rajdhani)', color: 'var(--foreground)' }}
            >
              Últimos cálculos
            </h2>
            <Link href="/panel/historial" className="text-sm" style={{ color: 'var(--primary-light)' }}>
              Ver todos
            </Link>
          </div>

          {recentCalculations.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--foreground-dim)' }}>
              Aún no tienes cálculos guardados. Realiza un cálculo con tu sesión iniciada.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentCalculations.map((calculation) => {
                const summary = formatCalculationSummary(
                  calculation.type,
                  calculation.input,
                  calculation.result
                );
                return (
                  <li key={calculation.id}>
                    <Link
                      href={CALCULATION_HREFS[calculation.type] ?? '/calculadoras'}
                      className="block p-3 rounded-lg transition-all hover:bg-slate-800/30"
                      style={{ border: '1px solid var(--card-border)' }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold" style={{ color: 'var(--primary-light)' }}>
                          {CALCULATION_LABELS[calculation.type] ?? calculation.type}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--foreground-dim)' }}>
                          {formatDate(calculation.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: 'var(--foreground)' }}>
                        {summary.result}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--foreground-dim)' }}>
                        {summary.inputs}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-rajdhani)', color: 'var(--foreground)' }}
            >
              Últimos informes
            </h2>
            <Link href="/panel/informes" className="text-sm" style={{ color: 'var(--primary-light)' }}>
              Ver todos
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--foreground-dim)' }}>
              Aún no tienes informes guardados. Usa el botón “Guardar en mi panel” en cualquier generador.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentReports.map((report) => (
                <li key={report.id}>
                  <Link
                    href={getReportHref(report.type, report.id)}
                    className="block p-3 rounded-lg transition-all hover:bg-slate-800/30"
                    style={{ border: '1px solid var(--card-border)' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>
                        {REPORT_TYPE_META[report.type]?.label ?? report.type}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--foreground-dim)' }}>
                        {formatDate(report.updatedAt)}
                      </span>
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'var(--foreground)' }}>
                      {report.title}
                    </p>
                    {report.clientName && (
                      <p className="text-xs mt-1" style={{ color: 'var(--foreground-dim)' }}>
                        {report.clientName}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <h2
        className="text-lg mb-4 font-semibold"
        style={{ fontFamily: 'var(--font-rajdhani)', color: 'var(--foreground)' }}
      >
        Acciones rápidas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/calculadoras"
          className="rounded-lg p-5 transition-all hover:scale-[1.02] card"
        >
          <div className="font-medium" style={{ color: 'var(--foreground)' }}>
            Ir a calculadoras
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--foreground-dim)' }}>
            Tus cálculos se guardarán automáticamente en el historial.
          </div>
        </Link>
        <Link
          href="/informes"
          className="rounded-lg p-5 transition-all hover:scale-[1.02] card"
        >
          <div className="font-medium" style={{ color: 'var(--foreground)' }}>
            Crear un informe
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--foreground-dim)' }}>
            Presupuestos, SEV, inspección e informe fotográfico.
          </div>
        </Link>
        <Link
          href="/panel/informes"
          className="rounded-lg p-5 transition-all hover:scale-[1.02] card"
        >
          <div className="font-medium" style={{ color: 'var(--foreground)' }}>
            Abrir informes guardados
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--foreground-dim)' }}>
            Retoma un informe, edítalo y vuelve a generar el PDF.
          </div>
        </Link>
      </div>
    </div>
  );
}
