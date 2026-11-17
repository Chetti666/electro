'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Check, HelpCircle, X } from 'lucide-react';
import {
  CALCULATOR_GUIDES,
  CALCULATOR_RESULT_STEPS,
  type CalculatorGuideId,
  type TourStep,
} from '@/lib/calculator-guides';

const SEEN_PREFIX = 'vmelectric:guia:v1:';
const SPOT_PAD = 6;
const CARD_MAX_W = 340;
const CARD_GAP = 14;
const EDGE = 12;
const OVERLAY = 'rgba(2, 6, 23, 0.8)';

type Box = { top: number; left: number; width: number; height: number };
type Viewport = { width: number; height: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function hasSeenGuide(guideId: string): boolean {
  try {
    return window.localStorage.getItem(SEEN_PREFIX + guideId) === '1';
  } catch {
    return false;
  }
}

function markGuideSeen(guideId: string): void {
  try {
    window.localStorage.setItem(SEEN_PREFIX + guideId, '1');
  } catch {
    // Sin localStorage (modo privado estricto): la guía simplemente se repite.
  }
}

/**
 * Guía paso a paso para las calculadoras: oscurece la página, resalta un
 * parámetro y muestra una tarjeta con la explicación.
 *
 * La primera visita abre la guía sola una sola vez (localStorage); el botón
 * «Guía rápida» la vuelve a mostrar cuando el usuario quiera.
 */
export function CalculatorTour({
  guideId,
  label = 'Guía rápida',
  autoStart = true,
  className = '',
}: {
  guideId: CalculatorGuideId;
  label?: string;
  autoStart?: boolean;
  className?: string;
}) {
  const guideSteps: readonly TourStep[] = CALCULATOR_GUIDES[guideId];
  const resultStep = CALCULATOR_RESULT_STEPS[guideId];

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<'guide' | 'result'>('guide');
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0 });
  const [cardHeight, setCardHeight] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const titleId = useId();
  const bodyId = useId();

  const steps = useMemo<readonly TourStep[]>(
    () => (phase === 'result' && resultStep ? [resultStep] : guideSteps),
    [guideSteps, phase, resultStep]
  );
  const total = steps.length;
  const step = steps[Math.min(index, total - 1)];
  const targetSelectors = useMemo<readonly string[]>(() => {
    const primary =
      typeof step.target === 'string' ? [step.target] : [...step.target];
    return step.fallback ? [...primary, step.fallback] : primary;
  }, [step]);

  // Montaje, portal y preferencia de movimiento reducido.
  useEffect(() => {
    setMounted(true);
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(query.matches);
    const onChange = () => setReduceMotion(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Mantiene el estado abierto accesible desde los temporizadores.
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Apertura automática solo en la primera visita y si el usuario no empezó a
  // escribir o desplazarse.
  useEffect(() => {
    if (!autoStart) return;
    if (hasSeenGuide(guideId)) return;

    const timer = window.setTimeout(() => {
      if (openRef.current) return;
      if (window.scrollY > 140) return;
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        active.closest('input, select, textarea')
      ) {
        return;
      }
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      setPhase('guide');
      setIndex(0);
      setOpen(true);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [autoStart, guideId]);

  const close = useCallback(() => {
    setOpen(false);
    markGuideSeen(phase === 'result' ? `${guideId}:resultado` : guideId);
  }, [guideId, phase]);

  const start = useCallback(() => {
    setViewport({ width: window.innerWidth, height: window.innerHeight });
    setPhase('guide');
    setIndex(0);
    setOpen(true);
  }, []);

  // Consejo posterior al cálculo: al enviar el formulario, si el resultado ya
  // está disponible, señala el botón «Copiar resultado» una sola vez.
  useEffect(() => {
    if (!resultStep) return;
    const resultKey = `${guideId}:resultado`;
    if (hasSeenGuide(resultKey)) return;

    const form = document.querySelector('form');
    if (!form) return;

    let timer = 0;
    const onSubmit = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (openRef.current) return;
        if (hasSeenGuide(resultKey)) return;

        const selector =
          typeof resultStep.target === 'string'
            ? resultStep.target
            : resultStep.target[0];
        if (!selector) return;

        const target = document.querySelector<HTMLElement>(selector);
        if (!target) return;
        if (target instanceof HTMLButtonElement && target.disabled) return;

        setViewport({ width: window.innerWidth, height: window.innerHeight });
        setPhase('result');
        setIndex(0);
        setOpen(true);
      }, 400);
    };

    form.addEventListener('submit', onSubmit);
    return () => {
      form.removeEventListener('submit', onSubmit);
      window.clearTimeout(timer);
    };
  }, [guideId, resultStep]);

  // Si el usuario pulsa el botón resaltado, el consejo se cierra y el clic
  // sigue su curso (abre la vista previa del resultado).
  useEffect(() => {
    if (!open || phase !== 'result') return;

    const selector = targetSelectors[0];
    if (!selector) return;

    const target = document.querySelector<HTMLElement>(selector);
    if (!target) return;

    const onTargetClick = () => close();
    target.addEventListener('click', onTargetClick);
    return () => target.removeEventListener('click', onTargetClick);
  }, [close, open, phase, targetSelectors]);

  const next = useCallback(() => {
    if (index + 1 >= total) {
      close();
      return;
    }
    setIndex(index + 1);
  }, [close, index, total]);

  const prev = useCallback(() => {
    setIndex((current) => Math.max(0, current - 1));
  }, []);

  // Tamaño de la ventana mientras la guía está abierta.
  useEffect(() => {
    if (!open) return;
    const update = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [open]);

  // Sigue el elemento resaltado aunque la página se desplace o cambie de tamaño.
  useEffect(() => {
    if (!open) return;

    const findTarget = () => {
      for (const selector of targetSelectors) {
        const element = document.querySelector<HTMLElement>(selector);
        if (element) return element;
      }
      return null;
    };

    const target = findTarget();
    if (!target) {
      setBox(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    const behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth';
    const mobile = window.innerWidth < 640;
    if (mobile) {
      // Deja el parámetro en la franja superior para que la tarjeta inferior no lo tape.
      const desiredTop = window.innerHeight * 0.18;
      if (Math.abs(rect.top - desiredTop) > 16) {
        window.scrollBy({ top: rect.top - desiredTop, behavior });
      }
    } else if (rect.top < EDGE || rect.bottom > window.innerHeight - EDGE) {
      target.scrollIntoView({ block: 'center', inline: 'nearest', behavior });
    }

    let frame = 0;
    let lastKey = '';
    const measure = () => {
      const current = findTarget();
      if (current) {
        const next = current.getBoundingClientRect();
        const key = [
          Math.round(next.top),
          Math.round(next.left),
          Math.round(next.width),
          Math.round(next.height),
        ].join(',');
        if (key !== lastKey) {
          lastKey = key;
          setBox({
            top: next.top,
            left: next.left,
            width: next.width,
            height: next.height,
          });
        }
      }
      frame = window.requestAnimationFrame(measure);
    };
    frame = window.requestAnimationFrame(measure);

    return () => window.cancelAnimationFrame(frame);
  }, [open, targetSelectors, reduceMotion]);

  // Foco en la tarjeta al abrir y en cada paso.
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => cardRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open, index]);

  // Al cerrar, devuelve el foco al botón que abrió la guía.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    return () => trigger?.focus();
  }, [open]);

  // Teclado: Esc cierra, flechas navegan y Tab queda dentro de la tarjeta.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = cardRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || active === cardRef.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close, next, open, prev]);

  // Alto real de la tarjeta para ubicarla sin tapar el parámetro.
  useEffect(() => {
    if (!open) return;
    const element = cardRef.current;
    if (!element) return;

    const update = () => setCardHeight(element.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [open, index, viewport.width]);

  const isMobile = viewport.width > 0 && viewport.width < 640;
  const cardWidth = Math.min(CARD_MAX_W, Math.max(0, viewport.width - EDGE * 2));

  // Área resaltada, recortada a la ventana (el objetivo puede estar en el borde).
  const spot = useMemo(() => {
    if (!box) return null;
    const top = clamp(box.top - SPOT_PAD, 0, viewport.height);
    const bottom = clamp(box.top + box.height + SPOT_PAD, 0, viewport.height);
    const left = clamp(box.left - SPOT_PAD, 0, viewport.width);
    const right = clamp(box.left + box.width + SPOT_PAD, 0, viewport.width);
    return { top, bottom, left, right };
  }, [box, viewport]);

  const layout = useMemo(() => {
    if (!box || viewport.width === 0) return { mode: 'center' as const };
    if (isMobile) return { mode: 'sheet' as const };

    const height = cardHeight || 210;
    const spaceBelow = viewport.height - (box.top + box.height);
    const spaceAbove = box.top;
    const preferBottom =
      spaceBelow >= height + CARD_GAP + EDGE || spaceBelow >= spaceAbove;

    const rawTop = preferBottom
      ? box.top + box.height + CARD_GAP
      : box.top - CARD_GAP - height;
    const top = clamp(rawTop, EDGE, viewport.height - height - EDGE);
    const left = clamp(
      box.left + box.width / 2 - cardWidth / 2,
      EDGE,
      viewport.width - cardWidth - EDGE
    );

    return {
      mode: preferBottom ? ('bottom' as const) : ('top' as const),
      top,
      left,
      arrowX: clamp(box.left + box.width / 2 - left, 20, cardWidth - 20),
    };
  }, [box, cardHeight, cardWidth, isMobile, viewport]);

  const arrow = layout.mode === 'top' || layout.mode === 'bottom';

  const card = (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      tabIndex={-1}
      className="tour-card pointer-events-auto flex max-h-[calc(100vh-24px)] flex-col overflow-hidden rounded-xl shadow-2xl outline-none"
      style={{
        width: layout.mode === 'sheet' ? 'auto' : cardWidth,
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        ...(layout.mode === 'sheet'
          ? { position: 'fixed', left: EDGE, right: EDGE, bottom: EDGE }
          : layout.mode === 'center'
            ? { position: 'relative' }
            : {
                position: 'fixed',
                top: layout.top,
                left: layout.left,
                transition: reduceMotion ? undefined : 'top 180ms ease, left 180ms ease',
              }),
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
          style={{
            background: 'rgba(37, 99, 235, 0.16)',
            border: '1px solid rgba(37, 99, 235, 0.4)',
            color: 'var(--primary-light)',
          }}
        >
          {phase === 'result'
            ? 'Consejo'
            : `Paso ${index + 1} de ${total}`}
        </span>
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar guía"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
          style={{
            border: '1px solid var(--card-border)',
            color: 'var(--foreground-muted)',
            background: 'transparent',
          }}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <div className="overflow-y-auto px-4 pb-3 pt-2">
        <h2
          id={titleId}
          className="text-base font-semibold"
          style={{
            color: 'var(--foreground)',
            fontFamily: 'var(--font-rajdhani)',
            letterSpacing: '0.4px',
          }}
        >
          {step.title}
        </h2>
        <p
          id={bodyId}
          className="mt-1.5 text-sm leading-relaxed"
          style={{ color: 'var(--foreground-muted)' }}
        >
          {step.body}
        </p>
      </div>

      <div
        className="mt-auto flex items-center justify-between gap-3 px-4 py-3"
        style={{ borderTop: '1px solid var(--card-border)' }}
      >
        {phase === 'guide' ? (
          <div className="flex items-center gap-1.5" aria-hidden>
            {steps.map((_, position) => (
              <span
                key={position}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: position === index ? 18 : 6,
                  background:
                    position === index
                      ? 'var(--primary-light)'
                      : 'var(--card-border)',
                }}
              />
            ))}
          </div>
        ) : (
          <span className="text-xs" style={{ color: 'var(--foreground-dim)' }}>
            Puedes cerrarla cuando quieras
          </span>
        )}

        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              type="button"
              onClick={prev}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
              style={{
                border: '1px solid var(--card-border)',
                color: 'var(--foreground-muted)',
                background: 'transparent',
              }}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Anterior
            </button>
          )}
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
            style={{
              background: 'var(--primary)',
              border: '1px solid var(--primary)',
            }}
          >
            {index + 1 === total ? (
              <>
                Listo
                <Check className="h-3.5 w-3.5" aria-hidden />
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={start}
        aria-haspopup="dialog"
        className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${className}`}
        style={{
          border: '1px solid var(--card-border)',
          color: 'var(--foreground-muted)',
          background: 'rgba(30, 41, 59, 0.6)',
        }}
      >
        <HelpCircle className="h-4 w-4" aria-hidden />
        {label}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-[120]">
            {box && spot && spot.bottom > spot.top ? (
              <>
                {/* Bandas que oscurecen todo salvo el parámetro resaltado. */}
                <div
                  className="pointer-events-auto fixed"
                  style={{
                    top: 0,
                    left: spot.left,
                    width: spot.right - spot.left,
                    height: spot.top,
                    background: OVERLAY,
                    transition: reduceMotion ? undefined : 'all 180ms ease',
                  }}
                />
                <div
                  className="pointer-events-auto fixed"
                  style={{
                    top: spot.bottom,
                    left: spot.left,
                    width: spot.right - spot.left,
                    bottom: 0,
                    background: OVERLAY,
                    transition: reduceMotion ? undefined : 'all 180ms ease',
                  }}
                />
                <div
                  className="pointer-events-auto fixed"
                  style={{
                    top: 0,
                    left: 0,
                    width: spot.left,
                    bottom: 0,
                    background: OVERLAY,
                    transition: reduceMotion ? undefined : 'all 180ms ease',
                  }}
                />
                <div
                  className="pointer-events-auto fixed"
                  style={{
                    top: 0,
                    left: spot.right,
                    right: 0,
                    bottom: 0,
                    background: OVERLAY,
                    transition: reduceMotion ? undefined : 'all 180ms ease',
                  }}
                />
                <div
                  aria-hidden
                  className="tour-spotlight pointer-events-none fixed rounded-[10px]"
                  style={{
                    top: box.top - SPOT_PAD,
                    left: box.left - SPOT_PAD,
                    width: box.width + SPOT_PAD * 2,
                    height: box.height + SPOT_PAD * 2,
                    border: '2px solid var(--primary-light)',
                    background: 'transparent',
                    transition: reduceMotion ? undefined : 'all 180ms ease',
                  }}
                />
              </>
            ) : (
              <div
                className="pointer-events-auto fixed inset-0"
                style={{ background: OVERLAY }}
              />
            )}

            {arrow && (
              <div
                aria-hidden
                className="pointer-events-none fixed h-3.5 w-3.5 rotate-45"
                style={{
                  top:
                    layout.mode === 'bottom'
                      ? layout.top - 7
                      : layout.top + cardHeight - 7,
                  left: layout.left + layout.arrowX - 7,
                  background: 'var(--card-bg)',
                  borderTop:
                    layout.mode === 'bottom'
                      ? '1px solid var(--card-border)'
                      : undefined,
                  borderLeft:
                    layout.mode === 'bottom'
                      ? '1px solid var(--card-border)'
                      : undefined,
                  borderRight:
                    layout.mode === 'top'
                      ? '1px solid var(--card-border)'
                      : undefined,
                  borderBottom:
                    layout.mode === 'top'
                      ? '1px solid var(--card-border)'
                      : undefined,
                }}
              />
            )}

            {layout.mode === 'center' ? (
              <div className="pointer-events-none fixed inset-0 flex items-center justify-center p-4">
                {card}
              </div>
            ) : (
              card
            )}
          </div>,
          document.body
        )}
    </>
  );
}
