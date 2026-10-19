'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import {
  CALCULATION_HREFS,
  CALCULATION_LABELS,
} from '@/lib/calculation-types';

export interface HistoryListItem {
  id: number;
  type: string;
  title: string | null;
  createdAt: string;
  inputs: string;
  result: string;
}

interface CalculationHistoryListProps {
  items: HistoryListItem[];
}

export default function CalculationHistoryList({
  items,
}: CalculationHistoryListProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | 'all' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deleteItem = async (id: number) => {
    if (!window.confirm('¿Eliminar este cálculo del historial?')) return;

    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/calculations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('No se pudo eliminar el cálculo.');
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'No se pudo eliminar el cálculo.'
      );
    } finally {
      setBusyId(null);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('¿Vaciar todo tu historial de cálculos?')) return;

    setBusyId('all');
    setError(null);
    try {
      const response = await fetch('/api/calculations', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('No se pudo vaciar el historial.');
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'No se pudo vaciar el historial.'
      );
    } finally {
      setBusyId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p style={{ color: 'var(--foreground-muted)' }}>
          No hay cálculos para este filtro.
        </p>
        <Link
          href="/calculadoras"
          className="text-sm inline-block mt-3"
          style={{ color: 'var(--primary-light)' }}
        >
          Ir a las calculadoras
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

      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearAll}
          disabled={busyId === 'all'}
          className="text-sm font-medium"
          style={{ color: 'var(--danger)' }}
        >
          {busyId === 'all' ? 'Vaciando...' : 'Vaciar historial'}
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--primary-light)' }}
                >
                  {CALCULATION_LABELS[item.type] ?? item.type}
                </span>
                <span className="text-xs" style={{ color: 'var(--foreground-dim)' }}>
                  {new Date(item.createdAt).toLocaleString('es-CL', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <p className="text-base font-semibold mt-1" style={{ color: 'var(--foreground)' }}>
                {item.title || item.result}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
                {item.result}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--foreground-dim)' }}>
                {item.inputs}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={CALCULATION_HREFS[item.type] ?? '/calculadoras'}
                className="text-xs"
                style={{ color: 'var(--secondary)' }}
              >
                Volver a calcular
              </Link>
              <button
                type="button"
                onClick={() => deleteItem(item.id)}
                disabled={busyId === item.id}
                aria-label="Eliminar cálculo"
                style={{ color: 'var(--danger)' }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
