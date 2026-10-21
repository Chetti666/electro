'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Heart,
  Lock,
  Server,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import {
  DONATION_MAX_AMOUNT,
  DONATION_MIN_AMOUNT,
  DONATION_PRESETS,
  isValidDonationAmount,
} from '@/lib/donation-config';

const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

function formatCLP(value: number): string {
  return currencyFormatter.format(value);
}

const DONATION_USES = [
  {
    icon: Server,
    title: 'Infraestructura',
    description: 'Dominio, servidores y base de datos para que todo siga en línea.',
    color: '#38bdf8',
  },
  {
    icon: BookOpen,
    title: 'Contenido normativo',
    description: 'Investigación y actualización de referencias RIC, SEC y TE1.',
    color: '#34d399',
  },
  {
    icon: Wrench,
    title: 'Nuevas herramientas',
    description: 'Calculadoras, informes y mejoras pensadas para el trabajo en terreno.',
    color: '#fbbf24',
  },
];

export default function DonarPage() {
  const [presetAmount, setPresetAmount] = useState<number>(DONATION_PRESETS[1]);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amount = useCustomAmount ? Number(customAmount) : presetAmount;
  const amountIsValid = isValidDonationAmount(amount);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/auth/me')
      .then((response) => (response.ok ? response.json() : null))
      .then((user: { email?: string; name?: string | null } | null) => {
        if (cancelled || !user) return;
        if (user.email) setEmail(user.email);
        if (user.name) setName(user.name);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!amountIsValid) {
      setError(
        `El monto debe estar entre ${formatCLP(DONATION_MIN_AMOUNT)} y ${formatCLP(DONATION_MAX_AMOUNT)}.`
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un correo electrónico válido para enviarte el comprobante.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          email: email.trim(),
          name: name.trim(),
          message: message.trim(),
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        url?: string;
        token?: string;
        error?: string;
      } | null;

      if (!response.ok || !data?.url || !data?.token) {
        throw new Error(data?.error || 'No pudimos iniciar el pago.');
      }

      window.location.href = `${data.url}?token=${encodeURIComponent(data.token)}`;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No pudimos iniciar el pago. Intenta nuevamente.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 420px at 50% -10%, rgba(37, 99, 235, 0.16), transparent 70%), radial-gradient(600px 320px at 85% 25%, rgba(20, 184, 166, 0.1), transparent 70%)',
        }}
      />

      <div className="page-container relative">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span
            className="badge inline-flex items-center gap-2 mb-5"
            style={{
              background: 'rgba(251, 113, 133, 0.12)',
              border: '1px solid rgba(251, 113, 133, 0.35)',
              color: '#fda4af',
            }}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            Apoya el proyecto
          </span>

          <h1 className="section-title">
            Tu aporte mantiene las herramientas{' '}
            <span style={{ color: '#fda4af' }}>gratis</span>
          </h1>
          <p className="section-subtitle">
            VMElectric es gratuito para electricistas y técnicos en Chile. Si te
            sirve en terreno, puedes ayudarnos a mantenerlo así.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl p-6 md:p-8 card"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <fieldset>
                <legend className="form-label">Elige un monto</legend>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DONATION_PRESETS.map((preset) => {
                    const selected = !useCustomAmount && presetAmount === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setPresetAmount(preset);
                          setUseCustomAmount(false);
                          setCustomAmount('');
                        }}
                        className="rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200"
                        style={{
                          background: selected
                            ? 'rgba(37, 99, 235, 0.2)'
                            : 'rgba(15, 23, 42, 0.6)',
                          border: selected
                            ? '1px solid var(--primary-light)'
                            : '1px solid var(--card-border)',
                          color: selected ? 'var(--foreground)' : 'var(--foreground-muted)',
                        }}
                      >
                        {formatCLP(preset)}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <label htmlFor="custom-amount" className="form-label">
                    Otro monto
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: 'var(--foreground-dim)' }}
                    >
                      $
                    </span>
                    <input
                      id="custom-amount"
                      type="number"
                      min={DONATION_MIN_AMOUNT}
                      max={DONATION_MAX_AMOUNT}
                      step={1}
                      inputMode="numeric"
                      value={customAmount}
                      onFocus={() => setUseCustomAmount(true)}
                      onChange={(event) => {
                        setCustomAmount(event.target.value);
                        setUseCustomAmount(true);
                      }}
                      placeholder="Ej: 7500"
                      className="form-input pl-8"
                    />
                  </div>
                  <p className="mt-2 text-xs" style={{ color: 'var(--foreground-dim)' }}>
                    Donaciones desde {formatCLP(DONATION_MIN_AMOUNT)} CLP.
                  </p>
                </div>
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="donor-name" className="form-label">
                    Nombre <span style={{ color: 'var(--foreground-dim)' }}>(opcional)</span>
                  </label>
                  <input
                    id="donor-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={80}
                    placeholder="Tu nombre"
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="donor-email" className="form-label">
                    Correo electrónico
                  </label>
                  <input
                    id="donor-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    maxLength={160}
                    placeholder="tu@correo.com"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="donor-message" className="form-label">
                  Mensaje <span style={{ color: 'var(--foreground-dim)' }}>(opcional)</span>
                </label>
                <textarea
                  id="donor-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="¿Hay alguna herramienta que te gustaría ver en VMElectric?"
                  className="form-input resize-none"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg p-4"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                  }}
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={isSubmitting ? undefined : { scale: 1.01 }}
                whileTap={isSubmitting ? undefined : { scale: 0.99 }}
                className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: isSubmitting
                    ? 'var(--primary-dark)'
                    : 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                  border: '1px solid var(--primary)',
                  boxShadow: '0 10px 30px rgba(37, 99, 235, 0.25)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Conectando con Flow...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    Donar {amountIsValid ? formatCLP(amount) : ''}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <p
                className="flex items-center justify-center gap-2 text-xs text-center"
                style={{ color: 'var(--foreground-dim)' }}
              >
                <Lock className="w-3.5 h-3.5" />
                Serás redirigido a Flow para completar el pago de forma segura.
              </p>
            </form>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="rounded-2xl p-6 card">
              <h2
                className="text-lg font-semibold mb-5"
                style={{
                  fontFamily: 'var(--font-rajdhani)',
                  color: 'var(--foreground)',
                  letterSpacing: '0.5px',
                }}
              >
                ¿En qué se usa tu aporte?
              </h2>

              <ul className="space-y-5">
                {DONATION_USES.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `${item.color}18`,
                        border: `1px solid ${item.color}40`,
                      }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        {item.title}
                      </p>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--foreground-dim)' }}>
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.22)',
              }}
            >
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    Pago seguro con Flow
                  </p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--foreground-dim)' }}>
                    No almacenamos los datos de tu tarjeta. Flow procesa el pago y
                    nosotros solo recibimos la confirmación.
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {[
                  'Donación única, sin suscripción',
                  'Comprobante enviado a tu correo',
                  'Puedes donar sin crear una cuenta',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-xs"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--success)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-center" style={{ color: 'var(--foreground-dim)' }}>
              ¿Prefieres aportar de otra forma?{' '}
              <Link href="/contact" className="underline hover:text-primary-light transition-colors">
                Escríbenos
              </Link>
              .
            </p>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
