'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { Calculator, Save, Trash2 } from 'lucide-react';
import { useCalculationRecorder } from '@/hooks/useCalculationRecorder';
import {
  useCalculationHistory,
  type HistoryEntry,
} from '@/hooks/useCalculationHistory';
import { usePersistentState } from '@/hooks/usePersistentState';
import { CopyResultButton } from '@/components/calculadoras/CopyResultButton';
import { DonationSupportCard } from '@/components/DonationSupportCard';
import {
  NOMINAL_VOLTAGE,
  formatAwg,
  isElectricalSystem,
  minimumAwgForSection,
  nextCommercialSection,
  requiredSection,
  type AwgSection,
  type ElectricalSystem,
} from '@/lib/electrical';

const FORM_KEY = 'vmelectric:calc:seccion:form:v1';
const HISTORY_KEY = 'vmelectric:calc:seccion:history:v1';

type SectionForm = {
  tipoSistema: ElectricalSystem;
  longitud: string;
  corriente: string;
  caidaTension: string;
};

type SectionHistoryItem = HistoryEntry & {
  tipoSistema: ElectricalSystem;
  longitud: string;
  corriente: string;
  caidaTension: string;
  seccion: number;
  comercial: number | null;
};

const DEFAULT_FORM: SectionForm = {
  tipoSistema: 'monofasico',
  longitud: '',
  corriente: '',
  caidaTension: '',
};

function toPositive(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function systemLabel(system: ElectricalSystem): string {
  return system === 'monofasico' ? 'Monofásico' : 'Trifásico';
}

function awgLabel(awg: AwgSection | null): string {
  return awg ? `${formatAwg(awg)} (${awg.mm2} mm²)` : '';
}

export default function CalculoSeccionPage() {
  const [form, setForm] = usePersistentState<SectionForm>(FORM_KEY, DEFAULT_FORM);
  const history = useCalculationHistory<SectionHistoryItem>(HISTORY_KEY);
  const recordCalculation = useCalculationRecorder();

  const [saved, setSaved] = useState(false);
  const [lastCalculated, setLastCalculated] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  // Permite llegar desde la calculadora de caída de tensión con los datos cargados.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextLongitud = params.get('longitud');
    const nextCorriente = params.get('corriente');
    const nextVp = params.get('vp');
    const nextSistema = params.get('sistema');

    if (!nextLongitud && !nextCorriente && !nextVp && !nextSistema) return;

    setForm((previous) => ({
      tipoSistema: isElectricalSystem(nextSistema)
        ? nextSistema
        : previous.tipoSistema,
      longitud: nextLongitud ?? previous.longitud,
      corriente: nextCorriente ?? previous.corriente,
      caidaTension: nextVp ?? previous.caidaTension,
    }));
  }, [setForm]);

  const longitudes = {
    longitud: toPositive(form.longitud),
    corriente: toPositive(form.corriente),
    caidaTension: toPositive(form.caidaTension),
  };

  const completo =
    form.longitud.trim() !== '' &&
    form.corriente.trim() !== '' &&
    form.caidaTension.trim() !== '';

  const validos =
    longitudes.longitud !== null &&
    longitudes.corriente !== null &&
    longitudes.caidaTension !== null;

  const seccion = useMemo(() => {
    if (!validos) return null;
    const value = requiredSection({
      system: form.tipoSistema,
      lengthM: longitudes.longitud as number,
      currentA: longitudes.corriente as number,
      maxDropV: longitudes.caidaTension as number,
    });
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [
    validos,
    form.tipoSistema,
    longitudes.longitud,
    longitudes.corriente,
    longitudes.caidaTension,
  ]);

  const comercial = seccion !== null ? nextCommercialSection(seccion) : null;
  const awg = seccion !== null ? minimumAwgForSection(seccion) : null;

  // El botón dice «Calcular» hasta que se calcula; después «Guardar cálculo».
  // Al cambiar o limpiar los datos vuelve a «Calcular».
  const formSignature = [
    form.tipoSistema,
    form.longitud,
    form.corriente,
    form.caidaTension,
  ].join('|');
  const yaCalculado = seccion !== null && lastCalculated === formSignature;

  const porcentajeVp =
    longitudes.caidaTension !== null
      ? (longitudes.caidaTension / NOMINAL_VOLTAGE[form.tipoSistema]) * 100
      : null;

  const error = completo && !validos
    ? 'Todos los valores deben ser números mayores que cero.'
    : null;

  const resumen =
    seccion !== null
      ? [
          `Sección mínima por caída de tensión: ${seccion.toFixed(2)} mm²${
            comercial ? ` (comercial ${comercial} mm²)` : ''
          }`,
          `L: ${form.longitud} m · I: ${form.corriente} A · Vp: ${form.caidaTension} V (${systemLabel(
            form.tipoSistema
          )})`,
          ...(awg
            ? [`AWG mínimo que cumple: ${formatAwg(awg)} (${awg.mm2} mm²)`]
            : []),
          'Importante: verifica también la capacidad de corriente con la tabla de la norma (RIC N°4).',
          'Calculado con VMElectric',
        ].join('\n')
      : '';

  const updateField = (field: keyof SectionForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const applyVpPreset = (ratio: number) => {
    updateField(
      'caidaTension',
      (NOMINAL_VOLTAGE[form.tipoSistema] * ratio).toFixed(1)
    );
  };

  const resetFields = () => {
    setForm((previous) => ({
      ...previous,
      longitud: '',
      corriente: '',
      caidaTension: '',
    }));
  };

  const restore = (item: SectionHistoryItem) => {
    setForm({
      tipoSistema: item.tipoSistema,
      longitud: item.longitud,
      corriente: item.corriente,
      caidaTension: item.caidaTension,
    });
  };

  const handleCalcular = (event: FormEvent) => {
    event.preventDefault();
    if (seccion === null) return;

    const latest = history.items[0];
    const duplicate =
      latest !== undefined &&
      latest.tipoSistema === form.tipoSistema &&
      latest.longitud === form.longitud &&
      latest.corriente === form.corriente &&
      latest.caidaTension === form.caidaTension;

    if (!duplicate) {
      history.add({
        tipoSistema: form.tipoSistema,
        longitud: form.longitud,
        corriente: form.corriente,
        caidaTension: form.caidaTension,
        seccion,
        comercial,
      });

      void recordCalculation({
        type: 'SECCION',
        title: `Sección ${seccion.toFixed(2)} mm²`,
        input: {
          longitud: form.longitud,
          corriente: form.corriente,
          caidaTension: form.caidaTension,
          tipoSistema: form.tipoSistema,
        },
        result: { seccion, comercial, tipoSistema: form.tipoSistema },
      });
    }

    setLastCalculated(formSignature);

    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 md:pt-32">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Cálculo de Sección de Conductores
        </h1>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Calcula la sección mínima que cumple la caída de tensión para una
          longitud y corriente dadas. El resultado se actualiza mientras
          escribes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna Izquierda: Formulario */}
        <div className="card">
          <h2
            className="text-lg sm:text-xl font-semibold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Datos de entrada
          </h2>
          <form onSubmit={handleCalcular} className="space-y-4">
            <div>
              <label className="form-label">Tipo de Sistema</label>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="tipo_sistema"
                    value="monofasico"
                    checked={form.tipoSistema === 'monofasico'}
                    onChange={() => updateField('tipoSistema', 'monofasico')}
                  />
                  <span className="ml-2">Monofásico (220 V)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="tipo_sistema"
                    value="trifasico"
                    checked={form.tipoSistema === 'trifasico'}
                    onChange={() => updateField('tipoSistema', 'trifasico')}
                  />
                  <span className="ml-2">Trifásica (380 V)</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="L" className="form-label">
                Longitud (L) en metros
              </label>
              <input
                type="number"
                id="L"
                inputMode="decimal"
                min="0"
                step="any"
                className="form-input"
                value={form.longitud}
                onChange={(event) => updateField('longitud', event.target.value)}
                placeholder="Ej: 50"
              />
            </div>

            <div>
              <label htmlFor="I" className="form-label">
                Corriente (I) en Amperios
              </label>
              <input
                type="number"
                id="I"
                inputMode="decimal"
                min="0"
                step="any"
                className="form-input"
                value={form.corriente}
                onChange={(event) => updateField('corriente', event.target.value)}
                placeholder="Ej: 15"
              />
            </div>

            <div>
              <label htmlFor="Vp" className="form-label">
                Caída de Tensión (Vp) en Voltios
              </label>
              <input
                type="number"
                id="Vp"
                inputMode="decimal"
                min="0"
                step="any"
                className="form-input"
                value={form.caidaTension}
                onChange={(event) =>
                  updateField('caidaTension', event.target.value)
                }
                placeholder="Ej: 6.9"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className="text-xs"
                  style={{ color: 'var(--foreground-dim)' }}
                >
                  Atajos:
                </span>
                {[0.03, 0.05].map((ratio) => {
                  const volts = NOMINAL_VOLTAGE[form.tipoSistema] * ratio;
                  return (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => applyVpPreset(ratio)}
                      className="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                      style={{
                        border: '1px solid var(--card-border)',
                        color: 'var(--foreground-muted)',
                      }}
                    >
                      {Math.round(ratio * 100)} % ·{' '}
                      {volts.toLocaleString('es-CL', {
                        maximumFractionDigits: 1,
                      })}{' '}
                      V
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto disabled:opacity-50"
                disabled={seccion === null}
              >
                {yaCalculado ? (
                  <Save className="h-4 w-4" aria-hidden />
                ) : (
                  <Calculator className="h-4 w-4" aria-hidden />
                )}
                {yaCalculado ? 'Guardar cálculo' : 'Calcular'}
              </button>
              <button
                type="button"
                onClick={resetFields}
                className="btn btn-outline w-full sm:w-auto"
              >
                Limpiar
              </button>
              {saved && (
                <span className="text-xs" style={{ color: 'var(--success)' }}>
                  Guardado en este dispositivo
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Columna Derecha: Resultados e Historial */}
        <div className="space-y-6">
          <DonationSupportCard tool="seccion" hasResult={seccion !== null} />

          {/* Resultados */}
          <div className="card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                className="text-lg sm:text-xl font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                Resultados
              </h2>
              <CopyResultButton text={resumen} />
            </div>

            {seccion === null && !error && (
              <div className="text-center py-8">
                <p style={{ color: 'var(--foreground-muted)' }}>
                  Completa longitud, corriente y caída de tensión.
                </p>
              </div>
            )}

            {seccion !== null && (
              <div className="space-y-4">
                <div
                  className="rounded-lg p-4 text-center"
                  style={{
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.35)',
                  }}
                >
                  <p
                    className="text-base sm:text-lg"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Sección mínima para cumplir la caída de tensión:
                  </p>
                  <p
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: 'var(--success)' }}
                  >
                    {seccion.toFixed(2)} mm²
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {comercial !== null && (
                    <span className="badge badge-success">
                      Comercial: {comercial} mm²
                    </span>
                  )}
                  {awg !== null && (
                    <span className="badge badge-warning">
                      AWG mínimo: {formatAwg(awg)} · {awg.mm2} mm²
                    </span>
                  )}
                  {porcentajeVp !== null && (
                    <span className="badge badge-primary">
                      Vp = {porcentajeVp.toFixed(2)} % de{' '}
                      {NOMINAL_VOLTAGE[form.tipoSistema]} V
                    </span>
                  )}
                </div>

                <div
                  role="note"
                  className="rounded-lg p-3 text-xs leading-relaxed sm:text-sm"
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: 'var(--foreground-muted)',
                  }}
                >
                  <p>
                    <strong style={{ color: 'var(--warning)' }}>
                      Importante:
                    </strong>{' '}
                    este valor es la sección mínima para cumplir la caída de
                    tensión indicada, pero no garantiza que el conductor soporte
                    la corriente. La sección mínima por capacidad de corriente se
                    determina con las tablas de corriente admisible de la norma
                    (RIC N°4).
                  </p>
                  <p className="mt-2">
                    Verifica ambos criterios y adopta la sección mayor.{' '}
                    <Link
                      href="/calculadoras/seccion-ric"
                      className="underline"
                      style={{ color: 'var(--secondary)' }}
                    >
                      Ver corriente admisible por conductor
                    </Link>
                    .
                  </p>
                </div>

                <p className="text-xs" style={{ color: 'var(--foreground-dim)' }}>
                  Sección calculada con cobre (ρ = 0,018 Ω·mm²/m) y factor{' '}
                  {form.tipoSistema === 'monofasico' ? '2' : '√3'}.
                </p>
              </div>
            )}

            {error && (
              <div
                className="mt-4 rounded-md p-3 text-center text-sm"
                role="alert"
                style={{
                  color: 'var(--danger)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Historial de Cálculos */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2
                className="text-lg sm:text-xl font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                Historial
              </h2>
              {history.items.length > 0 && (
                <button
                  onClick={history.clear}
                  className="text-sm hover:underline"
                  style={{ color: 'var(--danger)' }}
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-custom">
              {history.items.length === 0 ? (
                <p
                  className="text-center py-4 text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  Aún no hay cálculos guardados. Presiona «Guardar cálculo».
                </p>
              ) : (
                history.items.map((item) => {
                  const itemAwg = minimumAwgForSection(item.seccion);
                  return (
                  <div
                    key={item.id}
                    className="rounded-lg p-3"
                    style={{
                      background: 'var(--background-secondary)',
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className="font-semibold text-base sm:text-lg"
                          style={{ color: 'var(--primary-light)' }}
                        >
                          {item.seccion.toFixed(2)} mm²
                        </p>
                        <p
                          className="text-xs sm:text-sm"
                          style={{ color: 'var(--foreground-muted)' }}
                        >
                          L: {item.longitud} m · I: {item.corriente} A · Vp:{' '}
                          {item.caidaTension} V ({systemLabel(item.tipoSistema)})
                        </p>
                        {(item.comercial !== null || itemAwg !== null) && (
                          <p
                            className="mt-1 text-xs"
                            style={{ color: 'var(--foreground-dim)' }}
                          >
                            {item.comercial !== null
                              ? `Comercial: ${item.comercial} mm²`
                              : ''}
                            {item.comercial !== null && itemAwg !== null
                              ? ' · '
                              : ''}
                            {itemAwg !== null
                              ? `AWG mínimo: ${awgLabel(itemAwg)}`
                              : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => restore(item)}
                          className="rounded-md px-2 py-1 text-xs font-semibold"
                          style={{
                            border: '1px solid var(--card-border)',
                            color: 'var(--secondary)',
                          }}
                        >
                          Usar
                        </button>
                        <button
                          type="button"
                          onClick={() => history.remove(item.id)}
                          aria-label="Eliminar cálculo del historial"
                          className="rounded-md p-1.5"
                          style={{
                            border: '1px solid var(--card-border)',
                            color: 'var(--foreground-dim)',
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/calculadoras"
              className="inline-flex items-center hover:underline"
              style={{ color: 'var(--secondary)' }}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver a calculadoras
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
