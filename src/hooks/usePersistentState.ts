'use client';

import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readStored<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Estado respaldado por localStorage.
 *
 * - El valor inicial se usa en el servidor y en el primer render del cliente,
 *   así que no hay desajustes de hidratación.
 * - La hidratación ocurre en un efecto; los objetos se combinan con los valores
 *   por defecto para tolerar datos guardados con una forma anterior.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStored<T>(key);
    if (stored !== null) {
      setValue((current) =>
        isPlainObject(stored) && isPlainObject(current)
          ? ({ ...current, ...stored } as T)
          : stored
      );
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage puede estar bloqueado (modo privado estricto).
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}
