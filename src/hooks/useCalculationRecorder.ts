'use client';

import { useCallback } from 'react';
import type { CalculationTypeValue } from '@/lib/calculation-types';

export interface CalculationPayload {
  type: CalculationTypeValue;
  title?: string;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
}

export function useCalculationRecorder() {
  return useCallback(async (payload: CalculationPayload) => {
    try {
      await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // El historial es un extra: nunca debe interrumpir el cálculo.
    }
  }, []);
}
