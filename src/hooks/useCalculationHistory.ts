'use client';

import { useCallback } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';

export interface HistoryEntry {
  id: string;
  createdAt: number;
}

function createHistoryId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `calc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Historial de cálculos por herramienta, guardado solo en el navegador.
 * Se conserva entre recargas y se limita a `limit` entradas.
 */
export function useCalculationHistory<T extends HistoryEntry>(
  key: string,
  limit = 25
) {
  const [items, setItems, hydrated] = usePersistentState<T[]>(key, []);

  const add = useCallback(
    (entry: Omit<T, 'id' | 'createdAt'>): T => {
      const item = {
        ...entry,
        id: createHistoryId(),
        createdAt: Date.now(),
      } as T;

      setItems((previous) => [item, ...previous].slice(0, limit));
      return item;
    },
    [limit, setItems]
  );

  const remove = useCallback(
    (id: string) => {
      setItems((previous) => previous.filter((item) => item.id !== id));
    },
    [setItems]
  );

  const clear = useCallback(() => {
    setItems([]);
  }, [setItems]);

  return { items, add, remove, clear, hydrated };
}
