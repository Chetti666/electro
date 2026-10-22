'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, X } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import { DONATION_MIN_AMOUNT } from '@/lib/donation-config';

export type DonationTool =
  | 'caida-tension'
  | 'seccion'
  | 'calculadora-corriente'
  | 'empalmes'
  | 'seccion-ric'
  | 'rotuladora';

const TOOL_NAMES: Record<DonationTool, string> = {
  'caida-tension': 'calculadora de caída de tensión',
  seccion: 'calculadora de sección de conductor',
  'calculadora-corriente': 'calculadora de corriente y potencia',
  empalmes: 'calculadora de empalmes',
  'seccion-ric': 'calculadora de corriente admisible RIC',
  rotuladora: 'generador de rótulos',
};

const DISMISS_KEY = 'vmelectric:donation-support-dismissed:v1';

const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

type DonationSupportCardProps = {
  tool: DonationTool;
  /** Cuando ya hay un cálculo en pantalla el mensaje se vuelve más directo. */
  hasResult?: boolean;
  className?: string;
};

export function DonationSupportCard({
  tool,
  hasResult = false,
  className = '',
}: DonationSupportCardProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === '1') {
        setDismissed(true);
      }
    } catch {
      // localStorage puede no estar disponible (modo privado estricto).
    }
  }, []);

  if (dismissed) return null;

  const toolName = TOOL_NAMES[tool];

  const title = hasResult
    ? '¿Te sirvió este resultado?'
    : 'Herramientas gratis, sin anuncios';

  const description = hasResult
    ? 'Esta herramienta es gratis, sin registro y sin anuncios. Si te ahorró tiempo en terreno, tu aporte mantiene online las calculadoras, los informes y el contenido normativo.'
    : `VMElectric es gratis y sin anuncios. Si esta ${toolName} te resulta útil en terreno, puedes ayudarnos a mantenerla online y actualizada.`;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Si no se puede persistir, al menos se oculta en esta visita.
    }
  };

  const handleDonateClick = () => {
    sendGAEvent({ event: 'click_donacion', value: `calculadora_${tool}` });
  };

  return (
    <aside
      role="complementary"
      aria-label="Apoya VMElectric"
      className={`relative overflow-hidden rounded-xl p-4 sm:p-5 ${className}`}
      style={{
        background:
          'linear-gradient(135deg, rgba(251, 113, 133, 0.12) 0%, rgba(37, 99, 235, 0.1) 100%)',
        border: '1px solid rgba(251, 113, 133, 0.32)',
        boxShadow: '0 8px 24px rgba(2, 6, 23, 0.25)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(251, 113, 133, 0.28), transparent 70%)',
        }}
      />

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Ocultar mensaje de apoyo"
        className="absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-200 hover:bg-white/10"
        style={{ color: 'var(--foreground-dim)' }}
      >
        <X className="h-4 w-4" aria-hidden />
      </button>

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: 'rgba(251, 113, 133, 0.16)',
            border: '1px solid rgba(251, 113, 133, 0.35)',
            color: '#fda4af',
          }}
        >
          <Heart className="h-5 w-5 fill-current" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 pr-6 sm:pr-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {title}
          </p>
          <p
            className="mt-1 text-xs leading-relaxed sm:text-sm"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {description}
          </p>
          <p className="mt-2 text-[11px]" style={{ color: 'var(--foreground-dim)' }}>
            Desde {currencyFormatter.format(DONATION_MIN_AMOUNT)} CLP · Pago seguro con Flow
          </p>
        </div>

        <Link
          href="/donar"
          onClick={handleDonateClick}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
            border: '1px solid rgba(251, 113, 133, 0.5)',
            boxShadow: '0 8px 20px rgba(244, 63, 94, 0.22)',
          }}
        >
          <Heart className="h-4 w-4" aria-hidden />
          Apoyar el proyecto
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
