'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ExternalLink } from 'lucide-react';
import { getReportHref, REPORT_TYPE_META } from '@/lib/report-types';

export interface ReportListItem {
  id: number;
  type: string;
  title: string;
  clientName: string | null;
  reference: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ReportsList({ items }: { items: ReportListItem[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deleteReport = async (id: number) => {
    if (!window.confirm('¿Eliminar este informe guardado?')) return;

    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('No se pudo eliminar el informe.');
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'No se pudo eliminar el informe.'
      );
    } finally {
      setBusyId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p style={{ color: 'var(--foreground-muted)' }}>
          No hay informes guardados para este filtro.
        </p>
        <Link
          href="/informes"
          className="text-sm inline-block mt-3"
          style={{ color: 'var(--primary-light)' }}
        >
          Crear un informe
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)',
          }}
        >
          {error}
        </div>
      )}

      <ul className="space-y-3">
        {items.map((report) => {
          const meta = REPORT_TYPE_META[report.type];
          return (
            <li
              key={report.id}
              className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'var(--success)' }}
                  >
                    {meta?.label ?? report.type}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--foreground-dim)' }}>
                    Actualizado: {new Date(report.updatedAt).toLocaleString('es-CL', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <p
                  className="text-base font-semibold mt-1 truncate"
                  style={{ color: 'var(--foreground)' }}
                >
                  {report.title}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-dim)' }}>
                  {[report.clientName, report.reference].filter(Boolean).join(' · ') ||
                    'Sin cliente o referencia'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={getReportHref(report.type, report.id)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: 'var(--primary-light)' }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir
                </Link>
                <button
                  type="button"
                  onClick={() => deleteReport(report.id)}
                  disabled={busyId === report.id}
                  aria-label="Eliminar informe"
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
