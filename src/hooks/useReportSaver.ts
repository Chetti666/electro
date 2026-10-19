'use client';

import { useCallback, useState } from 'react';
import {
  persistSavedReport,
  type ReportSavePayload,
} from '@/lib/report-client';

export type SaveReportStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useReportSaver(initialReportId: number | null = null) {
  const [savedId, setSavedId] = useState<number | null>(initialReportId);
  const [status, setStatus] = useState<SaveReportStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (payload: ReportSavePayload): Promise<boolean> => {
      setStatus('saving');
      setError(null);

      try {
        const report = await persistSavedReport(payload, savedId);
        setSavedId(report.id);
        setStatus('saved');
        return true;
      } catch (err: unknown) {
        setStatus('error');
        setError(
          err instanceof Error ? err.message : 'No se pudo guardar el informe.'
        );
        return false;
      }
    },
    [savedId]
  );

  return {
    savedId,
    setSavedId,
    status,
    error,
    save,
  };
}
