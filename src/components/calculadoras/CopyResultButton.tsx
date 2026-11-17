'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, TriangleAlert, X } from 'lucide-react';

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

function statusLabel(status: CopyStatus, idleLabel: string): string {
  if (status === 'copied') return 'Copiado';
  if (status === 'error') return 'No se pudo copiar';
  return idleLabel;
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
  const [isOpen, setIsOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || active === dialogRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const frame = window.requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      window.cancelAnimationFrame(frame);
      trigger?.focus();
    };
  }, [isOpen]);

  const openPreview = () => {
    if (!text) return;
    if (timer.current) clearTimeout(timer.current);
    setStatus('idle');
    setIsOpen(true);
  };

  const closePreview = () => setIsOpen(false);

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
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPreview}
        disabled={!text}
        aria-haspopup="dialog"
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
        {statusLabel(status, label)}
      </button>

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
              background: 'rgba(2, 6, 23, 0.82)',
              backdropFilter: 'blur(6px)',
            }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closePreview();
            }}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl shadow-2xl outline-none"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
              }}
            >
              <div
                className="flex items-start justify-between gap-4 px-5 py-4"
                style={{ borderBottom: '1px solid var(--card-border)' }}
              >
                <div>
                  <h2
                    id={titleId}
                    className="text-lg font-semibold"
                    style={{
                      color: 'var(--foreground)',
                      fontFamily: 'var(--font-rajdhani)',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Vista previa del resultado
                  </h2>
                  <p
                    className="mt-1 text-xs leading-relaxed"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    Revisa el texto antes de copiarlo. Se pegará como texto
                    plano, sin formato.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePreview}
                  aria-label="Cerrar vista previa"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                  style={{
                    border: '1px solid var(--card-border)',
                    color: 'var(--foreground-muted)',
                    background: 'transparent',
                  }}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div className="overflow-y-auto p-5">
                <div
                  className="rounded-lg p-4 text-sm leading-relaxed"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {text}
                </div>
                <p
                  className="mt-3 text-xs"
                  style={{ color: 'var(--foreground-dim)' }}
                >
                  Esta es la apariencia del texto al pegarlo en WhatsApp, correo
                  o un documento.
                </p>
              </div>

              <div
                className="flex flex-col-reverse gap-2 px-5 py-4 sm:flex-row sm:justify-end"
                style={{ borderTop: '1px solid var(--card-border)' }}
              >
                <button
                  type="button"
                  onClick={closePreview}
                  className="btn btn-outline"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="btn btn-primary"
                >
                  {status === 'copied' ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : status === 'error' ? (
                    <TriangleAlert className="h-4 w-4" aria-hidden />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden />
                  )}
                  {statusLabel(status, 'Copiar resultado')}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
