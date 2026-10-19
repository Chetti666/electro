'use client';

import type { SaveReportStatus } from '@/hooks/useReportSaver';

interface SaveReportButtonProps {
  status: SaveReportStatus;
  error: string | null;
  isUpdate: boolean;
  onSave: () => void;
}

export default function SaveReportButton({
  status,
  error,
  isUpdate,
  onSave,
}: SaveReportButtonProps) {
  const label =
    status === 'saving'
      ? 'Guardando...'
      : status === 'saved'
        ? 'Informe guardado ✓'
        : isUpdate
          ? 'Actualizar informe guardado'
          : 'Guardar en mi panel';

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={onSave}
        disabled={status === 'saving'}
        className="btn btn-secondary w-full sm:w-auto"
        style={{ opacity: status === 'saving' ? 0.6 : 1 }}
      >
        {label}
      </button>
      {error && (
        <p className="mt-2 text-sm" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
      {status === 'saved' && (
        <p className="mt-2 text-sm" style={{ color: 'var(--success)' }}>
          Puedes verlo en tu panel, sección Informes guardados.
        </p>
      )}
    </div>
  );
}
