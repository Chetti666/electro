'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, TriangleAlert } from 'lucide-react';

type CopyStatus = 'idle' | 'copied' | 'error';

async function writeToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Cae al método clásico (contextos sin permisos de clipboard).
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!copied) throw new Error('No se pudo copiar');
}

export function CopyResultButton({
  text,
  label = 'Copiar resultado',
  className = '',
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleCopy = async () => {
    if (!text) return;

    try {
      await writeToClipboard(text);
      setStatus('copied');
    } catch {
      setStatus('error');
    }

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2200);
  };

  const color =
    status === 'copied'
      ? 'var(--success)'
      : status === 'error'
        ? 'var(--danger)'
        : 'var(--foreground-muted)';

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text}
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={{
        border: '1px solid var(--card-border)',
        color,
        background: 'transparent',
      }}
    >
      {status === 'copied' ? (
        <Check className="h-3.5 w-3.5" aria-hidden />
      ) : status === 'error' ? (
        <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      {status === 'copied' ? 'Copiado' : status === 'error' ? 'Error' : label}
    </button>
  );
}
