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
  COPPER_RESISTIVITY,
  NOMINAL_VOLTAGE,
  formatAwg,
  isElectricalSystem,
  minimumAwgForSection,
  nextCommercialSection,
  requiredSection,
  type AwgSection,
  type ElectricalSystem,
} from '@/lib/electrical';
import { formatResultCopy, withReference } from '@/lib/copy-format';
import { SECCION_FAQS } from '@/lib/seccion-faq';

const FORM_KEY = 'vmelectric:calc:seccion:form:v1';
const HISTORY_KEY = 'vmelectric:calc:seccion:history:v1';

/** Secciones comerciales con el calibre AWG/kcmil que las cubre. */
const SECTION_TABLE = [
  { mm2: 1.5, awg: '14', area: 2.08 },
  { mm2: 2.5, awg: '12', area: 3.31 },
  { mm2: 4, awg: '10', area: 5.26 },
  { mm2: 6, awg: '8', area: 8.37 },
  { mm2: 10, awg: '6', area: 13.3 },
  { mm2: 16, awg: '4', area: 21.2 },
  { mm2: 25, awg: '3', area: 26.7 },
  { mm2: 35, awg: '1', area: 42.4 },
  { mm2: 50, awg: '1/0', area: 53.5 },
  { mm2: 70, awg: '3/0', area: 85 },
  { mm2: 95, awg: '4/0', area: 107 },
  { mm2: 120, awg: '250 kcmil', area: 127 },
  { mm2: 150, awg: '300 kcmil', area: 152 },
  { mm2: 185, awg: '400 kcmil', area: 203 },
  { mm2: 240, awg: '500 kcmil', area: 253 },
  { mm2: 300, awg: '600 kcmil', area: 304 },
] as const;

/** Casos frecuentes usados en la tabla orientativa (220 V monofásico, 3 %). */
const COMMON_CASES = [
  { current: 10, length: 20 },
  { current: 16, length: 25 },
  { current: 20, length: 30 },
  { current: 25, length: 40 },
  { current: 32, length: 50 },
  { current: 40, length: 60 },
] as const;

type SectionForm = {
  referencia: string;
  tipoSistema: ElectricalSystem;
  tension: string;
  longitud: string;
  corriente: string;
  caidaTension: string;
};

type SectionHistoryItem = HistoryEntry & {
  referencia: string;
  tipoSistema: ElectricalSystem;
  tension?: string;
  longitud: string;
  corriente: string;
  caidaTension: string;
  seccion: number;
  comercial: number | null;
};

const DEFAULT_FORM: SectionForm = {
  referencia: '',
  tipoSistema: 'monofasico',
  tension: '',
  longitud: '',
  corriente: '',
  caidaTension: '',
};

function toPositive(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Número con separador decimal de es-CL (coma). */
function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Número con coma decimal y hasta 2 decimales, sin ceros de relleno. */
function formatLoose(value: number): string {
  return value.toLocaleString('es-CL', { maximumFractionDigits: 2 });
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
      ...previous,
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

  const tensionNominal =
    toPositive(form.tension) ?? NOMINAL_VOLTAGE[form.tipoSistema];

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
    form.tension,
    form.longitud,
    form.corriente,
    form.caidaTension,
  ].join('|');
  const yaCalculado = seccion !== null && lastCalculated === formSignature;

  const factorLabel = form.tipoSistema === 'monofasico' ? '2' : '√3';
  const formulaLines =
    seccion !== null
      ? [
          `S = (${factorLabel} × ρ × L × I) / Vp`,
          `S = (${factorLabel} × ${COPPER_RESISTIVITY} Ω·mm²/m × ${form.longitud} m × ${form.corriente} A) / ${form.caidaTension} V`,
          `S = ${formatNumber(seccion)} mm²`,
        ]
      : [];

  const porcentajeVp =
    longitudes.caidaTension !== null
      ? (longitudes.caidaTension / tensionNominal) * 100
      : null;

  const error = completo && !validos
    ? 'Todos los valores deben ser números mayores que cero.'
    : null;

  const resumen =
    seccion !== null
      ? formatResultCopy({
          title: withReference(
            'CÁLCULO DE SECCIÓN POR CAÍDA DE TENSIÓN',
            form.referencia
          ),
          sections: [
            {
              heading: 'Resultado',
              lines: [
                `Sección mínima: ${formatNumber(seccion)} mm²`,
                ...(comercial !== null
                  ? [`Sección comercial: ${comercial} mm²`]
                  : []),
                ...(awg !== null
                  ? [`AWG mínimo: ${formatAwg(awg)} (${awg.mm2} mm²)`]
                  : []),
              ],
            },
            { heading: 'Fórmula', lines: formulaLines },
            {
              heading: 'Datos',
              lines: [
                `Sistema: ${systemLabel(form.tipoSistema)} (${tensionNominal} V)`,
                `Longitud: ${form.longitud} m`,
                `Corriente: ${form.corriente} A`,
                `Caída admisible: ${form.caidaTension} V`,
              ],
            },
            {
              heading: 'Nota',
              lines: [
                'Esta sección cumple la caída de tensión, pero no garantiza la capacidad de corriente. Verifica la tabla de la norma (RIC N°4).',
              ],
            },
          ],
        })
      : '';

  const updateField = (field: keyof SectionForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const applyVpPreset = (ratio: number) => {
    updateField('caidaTension', (tensionNominal * ratio).toFixed(1));
  };

  const resetFields = () => {
    setForm((previous) => ({
      ...previous,
      referencia: '',
      longitud: '',
      corriente: '',
      caidaTension: '',
    }));
  };

  const restore = (item: SectionHistoryItem) => {
    setForm({
      referencia: item.referencia ?? '',
      tipoSistema: item.tipoSistema,
      tension: item.tension ?? '',
      longitud: item.longitud,
      corriente: item.corriente,
      caidaTension: item.caidaTension,
    });
  };

  const handleCalcular = (event: FormEvent) => {
    event.preventDefault();
    if (seccion === null) return;

    const latest = history.items[0];
    const referencia = form.referencia.trim();
    const duplicate =
      latest !== undefined &&
      (latest.referencia ?? '') === referencia &&
      latest.tipoSistema === form.tipoSistema &&
      (latest.tension ?? '') === form.tension &&
      latest.longitud === form.longitud &&
      latest.corriente === form.corriente &&
      latest.caidaTension === form.caidaTension;

    if (!duplicate) {
      history.add({
        referencia,
        tipoSistema: form.tipoSistema,
        tension: form.tension,
        longitud: form.longitud,
        corriente: form.corriente,
        caidaTension: form.caidaTension,
        seccion,
        comercial,
      });

      void recordCalculation({
        type: 'SECCION',
        title: withReference(`Sección ${formatNumber(seccion)} mm²`, referencia),
        input: {
          referencia,
          longitud: form.longitud,
          corriente: form.corriente,
          caidaTension: form.caidaTension,
          tipoSistema: form.tipoSistema,
          tension: form.tension,
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
          Calculadora de Sección de Cable y Conductores (mm²)
        </h1>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Calcula la sección mínima del conductor que cumple la caída de tensión
          para una longitud y corriente dadas, y obtén la sección comercial
          recomendada en mm² y su equivalencia en AWG. Funciona en instalaciones
          monofásicas y trifásicas de Chile, México, Perú y toda Latinoamérica. El
          resultado se actualiza mientras escribes.
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
              <label htmlFor="referencia" className="form-label">
                Referencia (opcional)
              </label>
              <input
                type="text"
                id="referencia"
                maxLength={60}
                className="form-input"
                value={form.referencia}
                onChange={(event) =>
                  updateField('referencia', event.target.value)
                }
                placeholder="Ej: Circuito 1, Tablero A"
              />
            </div>

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
              <label htmlFor="Vn" className="form-label">
                Tensión nominal (Vn) en voltios (opcional)
              </label>
              <input
                type="number"
                id="Vn"
                inputMode="decimal"
                min="0"
                step="any"
                className="form-input"
                value={form.tension}
                onChange={(event) => updateField('tension', event.target.value)}
                placeholder={`Ej: ${NOMINAL_VOLTAGE[form.tipoSistema]}`}
              />
              <p className="mt-2 text-[11px]" style={{ color: 'var(--foreground-dim)' }}>
                Se usa para los atajos de 3 % y 5 %. Si lo dejas vacío se toma
                220 V en monofásico y 380 V en trifásico.
              </p>
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
                  const volts = tensionNominal * ratio;
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
                    {formatNumber(seccion)} mm²
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
                      Vp = {formatNumber(porcentajeVp)} % de{' '}
                      {tensionNominal} V
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
                        {item.referencia ? (
                          <p
                            className="text-xs font-semibold"
                            style={{ color: 'var(--secondary)' }}
                          >
                            {item.referencia}
                          </p>
                        ) : null}
                        <p
                          className="font-semibold text-base sm:text-lg"
                          style={{ color: 'var(--primary-light)' }}
                        >
                          {formatNumber(item.seccion)} mm²
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

      <section className="mt-14 space-y-6" aria-labelledby="guia-seccion">
        <div className="card p-6 md:p-8">
          <h2
            id="guia-seccion"
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Fórmula para calcular la sección de un conductor
          </h2>
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: 'var(--foreground-muted)' }}
          >
            La sección por caída de tensión se obtiene despejando el área del
            conductor en la fórmula de caída de tensión. El resultado se expresa
            en mm² y siempre se adopta la sección comercial inmediatamente
            superior, porque una sección menor no cumpliría el límite exigido.
          </p>
          <pre
            className="overflow-x-auto rounded-lg p-4 text-xs sm:text-sm mb-3"
            style={{
              background: 'var(--background-secondary)',
              border: '1px solid var(--card-border)',
              color: 'var(--foreground)',
            }}
          >
{`Monofásico:  S = (2 × ρ × L × I) / Vp
Trifásico:   S = (√3 × ρ × L × I) / Vp`}
          </pre>
          <ul
            className="text-sm space-y-1 list-disc pl-5 mb-5"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <li>
              <strong>S:</strong> sección del conductor en mm².
            </li>
            <li>
              <strong>ρ:</strong> resistividad del cobre, 0,018 Ω·mm²/m.
            </li>
            <li>
              <strong>L:</strong> longitud del tramo en metros (m).
            </li>
            <li>
              <strong>I:</strong> corriente de carga en amperes (A).
            </li>
            <li>
              <strong>Vp:</strong> caída de tensión admisible en voltios (V).
            </li>
          </ul>

          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Ejemplo de cálculo paso a paso
          </h3>
          <p
            className="text-sm leading-relaxed mb-2"
            style={{ color: 'var(--foreground-muted)' }}
          >
            Circuito monofásico de 220 V con 50 m de cable, 15 A de carga y un
            límite del 3 %:
          </p>
          <ol
            className="text-sm space-y-1 list-decimal pl-5 mb-3"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <li>
              Caída admisible: 3 % de 220 V = <strong>6,6 V</strong>.
            </li>
            <li>
              Aplica la fórmula: (2 × 0,018 × 50 × 15) / 6,6 = 27 / 6,6 ={' '}
              <strong>4,09 mm²</strong>.
            </li>
            <li>
              Sección comercial: <strong>6 mm²</strong>, el siguiente valor de la
              serie métrica.
            </li>
            <li>
              Equivalencia: <strong>10 AWG</strong> (5,26 mm²) también supera los
              4,09 mm² requeridos.
            </li>
          </ol>
          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: 'var(--foreground-dim)' }}
          >
            En trifásico de 380 V, con 50 m, 40 A y el mismo 3 % (11,4 V), la
            fórmula usa √3: (1,732 × 0,018 × 50 × 40) / 11,4 ={' '}
            <strong>5,47 mm²</strong>, que también se resuelve con 6 mm²
            comerciales. A igual carga y longitud, el trifásico requiere menos
            sección que el monofásico.
          </p>

          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Sección del conductor en Chile, México y Perú
          </h3>
          <ul
            className="text-sm space-y-2 list-disc pl-5 mb-2"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <li>
              <strong>Chile:</strong> el Pliego Técnico Normativo RIC N°4 y la NCh
              Elec. 4/2003 fijan la caída de tensión admisible y las secciones
              mínimas por circuito. Las redes de consumo suelen trabajar a 220 V
              monofásico y 380 V trifásico.
            </li>
            <li>
              <strong>México:</strong> la NOM-001-SEDE define los límites de caída
              de tensión para circuitos derivados y alimentadores, con tensiones
              habituales de 127 V y 220 V.
            </li>
            <li>
              <strong>Perú:</strong> el Código Nacional de Electricidad
              (CNE-Utilización) establece los límites; la tensión residencial más
              común es 220 V.
            </li>
          </ul>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--foreground-dim)' }}
          >
            La fórmula no cambia entre países: solo debes usar la tensión de tu
            red y el porcentaje que exige tu normativa. Verifica siempre el valor
            vigente en tu instalación.
          </p>
        </div>

        <div className="card p-6 md:p-8">
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Tabla de secciones comerciales y equivalencia AWG
          </h2>
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: 'var(--foreground-muted)' }}
          >
            El calibre indicado es el más pequeño cuya área es igual o superior a
            la sección en mm², es decir, el que la cubre sin quedarse corto.
          </p>
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              style={{ borderCollapse: 'collapse' }}
            >
              <thead>
                <tr style={{ color: 'var(--foreground)' }}>
                  <th
                    className="text-left font-semibold px-3 py-2"
                    style={{ borderBottom: '1px solid var(--card-border)' }}
                  >
                    Sección (mm²)
                  </th>
                  <th
                    className="text-left font-semibold px-3 py-2"
                    style={{ borderBottom: '1px solid var(--card-border)' }}
                  >
                    Calibre AWG/kcmil
                  </th>
                  <th
                    className="text-left font-semibold px-3 py-2"
                    style={{ borderBottom: '1px solid var(--card-border)' }}
                  >
                    Área del calibre (mm²)
                  </th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--foreground-muted)' }}>
                {SECTION_TABLE.map((row) => (
                  <tr key={row.mm2}>
                    <td
                      className="px-3 py-1.5"
                      style={{ borderBottom: '1px solid var(--card-border)' }}
                    >
                      {formatLoose(row.mm2)}
                    </td>
                    <td
                      className="px-3 py-1.5"
                      style={{ borderBottom: '1px solid var(--card-border)' }}
                    >
                      {row.awg}
                    </td>
                    <td
                      className="px-3 py-1.5"
                      style={{ borderBottom: '1px solid var(--card-border)' }}
                    >
                      {formatLoose(row.area)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            ¿Qué sección de cable necesito? Casos frecuentes
          </h2>
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: 'var(--foreground-muted)' }}
          >
            Valores calculados en monofásico de 220 V, cobre (ρ = 0,018 Ω·mm²/m) y
            una caída de tensión máxima del 3 % (6,6 V).
          </p>
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              style={{ borderCollapse: 'collapse' }}
            >
              <thead>
                <tr style={{ color: 'var(--foreground)' }}>
                  <th
                    className="text-left font-semibold px-3 py-2"
                    style={{ borderBottom: '1px solid var(--card-border)' }}
                  >
                    Corriente
                  </th>
                  <th
                    className="text-left font-semibold px-3 py-2"
                    style={{ borderBottom: '1px solid var(--card-border)' }}
                  >
                    Longitud
                  </th>
                  <th
                    className="text-left font-semibold px-3 py-2"
                    style={{ borderBottom: '1px solid var(--card-border)' }}
                  >
                    Sección mínima
                  </th>
                  <th
                    className="text-left font-semibold px-3 py-2"
                    style={{ borderBottom: '1px solid var(--card-border)' }}
                  >
                    Comercial
                  </th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--foreground-muted)' }}>
                {COMMON_CASES.map((item) => {
                  const needed = requiredSection({
                    system: 'monofasico',
                    lengthM: item.length,
                    currentA: item.current,
                    maxDropV: 220 * 0.03,
                  });
                  const comercialCase = nextCommercialSection(needed);
                  return (
                    <tr key={`${item.current}-${item.length}`}>
                      <td
                        className="px-3 py-1.5"
                        style={{ borderBottom: '1px solid var(--card-border)' }}
                      >
                        {item.current} A
                      </td>
                      <td
                        className="px-3 py-1.5"
                        style={{ borderBottom: '1px solid var(--card-border)' }}
                      >
                        {item.length} m
                      </td>
                      <td
                        className="px-3 py-1.5"
                        style={{ borderBottom: '1px solid var(--card-border)' }}
                      >
                        {formatNumber(needed)} mm²
                      </td>
                      <td
                        className="px-3 py-1.5"
                        style={{ borderBottom: '1px solid var(--card-border)' }}
                      >
                        {comercialCase !== null ? `${formatLoose(comercialCase)} mm²` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p
            className="mt-4 text-sm leading-relaxed"
            style={{ color: 'var(--foreground-dim)' }}
          >
            Esta tabla resuelve solo el criterio de caída de tensión. Debes
            comprobar además la corriente admisible del conductor con las tablas
            de tu normativa y adoptar la sección mayor de ambos criterios.
          </p>
        </div>

        <div className="card p-6 md:p-8">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Preguntas frecuentes sobre la sección del conductor
          </h2>
          <div className="space-y-3">
            {SECCION_FAQS.map((faq) => (
              <details
                key={faq.question}
                className="rounded-lg p-4"
                style={{
                  background: 'var(--background-secondary)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <summary
                  className="cursor-pointer text-sm sm:text-base font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  {faq.question}
                </summary>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Sigue calculando
          </h2>
          <ul
            className="space-y-2 text-sm"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <li>
              <Link
                href="/calculadoras/caida-tension"
                className="underline"
                style={{ color: 'var(--secondary)' }}
              >
                Calculadora de caída de tensión
              </Link>{' '}
              para verificar la pérdida de voltaje del conductor ya instalado.
            </li>
            <li>
              <Link
                href="/calculadoras/seccion-ric"
                className="underline"
                style={{ color: 'var(--secondary)' }}
              >
                Corriente admisible por RIC
              </Link>{' '}
              para comprobar que el cable soporta la carga.
            </li>
            <li>
              <Link
                href="/calculadoras/calculadora-corriente"
                className="underline"
                style={{ color: 'var(--secondary)' }}
              >
                Calculadora de corriente y potencia
              </Link>{' '}
              para convertir watts y kW en amperes.
            </li>
            <li>
              <Link
                href="/blog"
                className="underline"
                style={{ color: 'var(--secondary)' }}
              >
                Blog técnico
              </Link>{' '}
              con guías de normativa y buenas prácticas eléctricas.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
