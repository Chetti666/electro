import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  isReportType,
  REPORT_TYPE_META,
  REPORT_TYPE_VALUES,
} from '@/lib/report-types';
import ReportsList from '@/components/panel/ReportsList';

export default async function PanelReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role === 'ADMIN') redirect('/admin');

  const { tipo } = await searchParams;
  const selectedType = tipo && isReportType(tipo) ? tipo : null;

  const reports = await prisma.savedReport.findMany({
    where: {
      userId: user.id,
      ...(selectedType ? { type: selectedType } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      type: true,
      title: true,
      clientName: true,
      reference: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const items = reports.map((report) => ({
    ...report,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  }));

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
        Informes guardados
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--foreground-muted)' }}>
        Abre un informe para recuperar sus datos, editarlo y regenerar el PDF.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/panel/informes"
          className="px-3 py-1.5 rounded-full text-xs font-medium"
          style={
            !selectedType
              ? {
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  color: 'var(--success)',
                }
              : {
                  border: '1px solid var(--card-border)',
                  color: 'var(--foreground-muted)',
                }
          }
        >
          Todos
        </Link>
        {REPORT_TYPE_VALUES.map((type) => (
          <Link
            key={type}
            href={`/panel/informes?tipo=${type}`}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={
              selectedType === type
                ? {
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.35)',
                    color: 'var(--success)',
                  }
                : {
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground-muted)',
                  }
            }
          >
            {REPORT_TYPE_META[type].label}
          </Link>
        ))}
      </div>

      <ReportsList items={items} />
    </div>
  );
}
