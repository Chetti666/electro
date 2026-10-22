'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { Save, Trash2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import annotationPlugin, {
  type AnnotationOptions,
} from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import { useCalculationRecorder } from '@/hooks/useCalculationRecorder';
import {
  useCalculationHistory,
  type HistoryEntry,
} from '@/hooks/useCalculationHistory';
import { usePersistentState } from '@/hooks/usePersistentState';
import { CopyResultButton } from '@/components/calculadoras/CopyResultButton';
import { DonationSupportCard } from '@/components/DonationSupportCard';
import {
  AWG_PRESETS,
  COPPER_RESISTIVITY,
  COMMERCIAL_SECTIONS,
  MAX_VOLTAGE_DROP_RATIO,
  awgForArea,
  formatAwg,
  nominalVoltage,
  phaseFactor,
  voltageDrop,
  voltageDropLimit,
  voltageDropPercent,
  maxLengthForDrop,
  type ElectricalSystem,
} from '@/lib/electrical';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

const FORM_KEY = 'vmelectric:calc:caida-tension:form:v1';
const HISTORY_KEY = 'vmelectric:calc:caida-tension:history:v1';

const CHART_TEXT = '#94a3b8';
const CHART_TITLE = '#e2e8f0';
const CHART_GRID = 'rgba(148, 163, 184, 0.14)';

type DropForm = {
  tipoSistema: ElectricalSystem;
  seccion: string;
  longitudMaxima: string;
  corriente: string;
};

type DropHistoryItem = HistoryEntry & {
  tipoSistema: ElectricalSystem;
  seccion: string;
  longitudMaxima: string;
  corriente: string;
  vp: number;
  porcentaje: number;
  cumple: boolean;
};

const DEFAULT_FORM: DropForm = {
  tipoSistema: 'monofasico',
  seccion: '',
  longitudMaxima: '',
  corriente: '',
};

function toPositive(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function systemLabel(system: ElectricalSystem): string {
  return system === 'monofasico' ? 'Monofásico' : 'Trifásico';
}

/** Agrega el equivalente AWG cuando el valor coincide con una sección AWG. */
function sectionLabel(value: string): string {
  const area = Number.parseFloat(value.replace(',', '.'));
  const awg = Number.isFinite(area) ? awgForArea(area) : null;
  return `${value} mm²${awg ? ` (${formatAwg(awg)})` : ''}`;
}

export default function CalculoVpPage() {
  const [form, setForm] = usePersistentState<DropForm>(FORM_KEY, DEFAULT_FORM);
  const history = useCalculationHistory<DropHistoryItem>(HISTORY_KEY);
  const recordCalculation = useCalculationRecorder();

  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const seccion = toPositive(form.seccion);
  const selectedAwg = seccion !== null ? awgForArea(seccion) : null;
  const longitud = toPositive(form.longitudMaxima);
  const corriente = toPositive(form.corriente);

  const completo =
    form.seccion.trim() !== '' &&
    form.longitudMaxima.trim() !== '' &&
    form.corriente.trim() !== '';

  const validos =
    seccion !== null && longitud !== null && corriente !== null;

  const limiteV = voltageDropLimit(form.tipoSistema);

  const vp = useMemo(() => {
    if (!validos) return null;
    const value = voltageDrop({
      system: form.tipoSistema,
      sectionMm2: seccion as number,
      lengthM: longitud as number,
      currentA: corriente as number,
    });
    return Number.isFinite(value) ? value : null;
  }, [validos, form.tipoSistema, seccion, longitud, corriente]);

  const porcentaje =
    vp !== null ? voltageDropPercent(form.tipoSistema, vp) : null;
  const cumple = vp !== null ? vp <= limiteV + 1e-9 : null;

  const longitudMaxima = useMemo(() => {
    if (!validos) return null;
    const value = maxLengthForDrop({
      system: form.tipoSistema,
      sectionMm2: seccion as number,
      currentA: corriente as number,
      maxDropV: limiteV,
    });
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [validos, form.tipoSistema, seccion, corriente, limiteV]);

  const chart = useMemo(() => {
    if (
      !validos ||
      vp === null ||
      seccion === null ||
      longitud === null ||
      corriente === null
    ) {
      return null;
    }

    const factor = phaseFactor(form.tipoSistema) * COPPER_RESISTIVITY;
    const pointCount = Math.max(2, Math.min(100, Math.ceil(longitud)));
    const points: { x: number; y: number }[] = [];

    for (let index = 0; index <= pointCount; index += 1) {
      const length = (longitud / pointCount) * index;
      points.push({ x: length, y: (factor * length * corriente) / seccion });
    }

    const cruce = !cumple && longitudMaxima !== null ? longitudMaxima : null;
    if (cruce !== null) {
      points.push({ x: cruce, y: limiteV });
      points.sort((a, b) => a.x - b.x);
    }

    const labels = points.map((point) => point.x.toFixed(2));
    const values = points.map((point) => point.y);

    const annotations: Record<string, AnnotationOptions> = {
      limiteHorizontal: {
        type: 'line',
        yMin: limiteV,
        yMax: limiteV,
        borderColor: 'rgba(239, 68, 68, 0.9)',
        borderWidth: 2,
        borderDash: [10, 5],
        label: {
          content: `Límite 3 % (${limiteV.toFixed(2)} V)`,
          display: true,
          position: 'end',
          backgroundColor: 'rgba(239, 68, 68, 0.85)',
          color: '#fff',
        },
      },
      puntoInicial: {
        type: 'point',
        xValue: labels[0],
        yValue: values[0],
        backgroundColor: '#38bdf8',
        radius: 5,
      },
      labelInicial: {
        type: 'label',
        xValue: labels[0],
        yValue: values[0],
        content: ['0 m', `${values[0].toFixed(2)} V`],
        color: CHART_TEXT,
        font: { size: 10 },
        xAdjust: -20,
        yAdjust: -20,
      },
      puntoFinal: {
        type: 'point',
        xValue: labels[labels.length - 1],
        yValue: values[values.length - 1],
        backgroundColor: '#38bdf8',
        radius: 5,
      },
      labelFinal: {
        type: 'label',
        xValue: labels[labels.length - 1],
        yValue: values[values.length - 1],
        content: [`${longitud.toFixed(2)} m`, `${vp.toFixed(2)} V`],
        color: CHART_TEXT,
        font: { size: 10 },
        xAdjust: 20,
        yAdjust: 20,
      },
    };

    if (cruce !== null) {
      annotations.limiteVertical = {
        type: 'line',
        xMin: cruce,
        xMax: cruce,
        borderColor: 'rgba(245, 158, 11, 0.9)',
        borderWidth: 2,
        borderDash: [5, 5],
      };
      annotations.puntoCruce = {
        type: 'point',
        xValue: cruce,
        yValue: limiteV,
        backgroundColor: '#f59e0b',
        borderColor: '#b45309',
        borderWidth: 2,
        radius: 6,
      };
      annotations.labelCruce = {
        type: 'label',
        xValue: cruce,
        yValue: limiteV,
        content: `${cruce.toFixed(2)} m`,
        color: '#0b1121',
        font: { size: 10 },
        backgroundColor: 'rgba(245, 158, 11, 0.9)',
        yAdjust: -20,
      };
    }

    const data: ChartData<'line'> = {
      labels,
      datasets: [
        {
          label: 'Caída de tensión (V)',
          data: values,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          fill: true,
          tension: 0.15,
          pointRadius: 0,
          pointHitRadius: 12,
        },
      ],
    };

    const options: ChartOptions<'line'> = {
      responsive: true,
      plugins: {
        legend: { labels: { color: CHART_TEXT } },
        title: {
          display: true,
          text: 'Caída de tensión vs. longitud',
          color: CHART_TITLE,
        },
        tooltip: {
          callbacks: {
            title: (items) => `${items[0]?.label ?? ''} m`,
            label: (item) => `${Number(item.parsed.y).toFixed(2)} V`,
          },
        },
        annotation: { annotations },
      },
      scales: {
        x: {
          title: { display: true, text: 'Longitud (m)', color: CHART_TEXT },
          ticks: { color: CHART_TEXT, maxTicksLimit: 10 },
          grid: { color: CHART_GRID },
        },
        y: {
          title: { display: true, text: 'Caída de tensión (V)', color: CHART_TEXT },
          ticks: { color: CHART_TEXT },
          grid: { color: CHART_GRID },
          beginAtZero: true,
        },
      },
    };

    return { data, options };
  }, [
    validos,
    vp,
    seccion,
    longitud,
    corriente,
    form.tipoSistema,
    cumple,
    longitudMaxima,
    limiteV,
  ]);

  const error = completo && !validos
    ? 'Todos los valores deben ser números mayores que cero.'
    : null;

  const resumen =
    vp !== null && porcentaje !== null
      ? [
          `Caída de tensión: ${vp.toFixed(2)} V (${porcentaje.toFixed(2)} %) · ${
            cumple ? 'Cumple' : 'Supera'
          } el límite de 3 %`,
          `S: ${sectionLabel(form.seccion)} · L: ${form.longitudMaxima} m · I: ${form.corriente} A (${systemLabel(
            form.tipoSistema
          )})`,
          `Límite: ${limiteV.toFixed(2)} V${
            longitudMaxima !== null
              ? ` · Longitud máxima: ${longitudMaxima.toFixed(2)} m`
              : ''
          }`,
          'Calculado con VMElectric',
        ].join('\n')
      : '';

  const seccionHref = `/calculadoras/seccion?${new URLSearchParams({
    longitud: form.longitudMaxima,
    corriente: form.corriente,
    vp: limiteV.toFixed(2),
    sistema: form.tipoSistema,
  }).toString()}`;

  const updateField = (field: keyof DropForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleCalcular = (event: FormEvent) => {
    event.preventDefault();
    if (vp === null || porcentaje === null || cumple === null) return;

    const latest = history.items[0];
    const duplicate =
      latest !== undefined &&
      latest.tipoSistema === form.tipoSistema &&
      latest.seccion === form.seccion &&
      latest.longitudMaxima === form.longitudMaxima &&
      latest.corriente === form.corriente;

    if (!duplicate) {
      history.add({
        tipoSistema: form.tipoSistema,
        seccion: form.seccion,
        longitudMaxima: form.longitudMaxima,
        corriente: form.corriente,
        vp,
        porcentaje,
        cumple,
      });
    }

    void recordCalculation({
      type: 'CAIDA_TENSION',
      title: `Caída de tensión ${vp.toFixed(2)} V`,
      input: {
        tipoSistema: form.tipoSistema,
        seccion: form.seccion,
        longitudMaxima: form.longitudMaxima,
        corriente: form.corriente,
      },
      result: {
        caidaTension: vp,
        unidad: 'V',
        limiteVp: limiteV,
        cumple,
      },
    });

    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2200);
  };

  const resetFields = () => {
    setForm((previous) => ({
      ...previous,
      seccion: '',
      longitudMaxima: '',
      corriente: '',
    }));
  };

  const restore = (item: DropHistoryItem) => {
    setForm({
      tipoSistema: item.tipoSistema,
      seccion: item.seccion,
      longitudMaxima: item.longitudMaxima,
      corriente: item.corriente,
    });
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 md:pt-32">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Calculadora de Caída de Tensión (Vp)
        </h1>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Visualiza la caída de tensión a lo largo del conductor, su límite del{' '}
          {Math.round(MAX_VOLTAGE_DROP_RATIO * 100)} % y la longitud máxima
          admisible. El resultado se actualiza mientras escribes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Columna Izquierda: Formulario e Historial */}
        <div className="md:col-span-2 space-y-8">
          <div className="card">
            <h2
              className="text-lg sm:text-xl font-semibold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Datos de entrada
            </h2>
            <form onSubmit={handleCalcular} className="space-y-4">
              <div>
                <label htmlFor="tipoCalculo" className="form-label">
                  Tipo de sistema
                </label>
                <select
                  id="tipoCalculo"
                  value={form.tipoSistema}
                  onChange={(event) =>
                    updateField('tipoSistema', event.target.value)
                  }
                  className="form-select"
                >
                  <option value="monofasico">Monofásico (220 V)</option>
                  <option value="trifasico">Trifásico (380 V)</option>
                </select>
              </div>

              <div>
                <label htmlFor="S" className="form-label">
                  Sección del conductor (S) en mm²
                </label>
                <input
                  type="number"
                  id="S"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.seccion}
                  onChange={(event) => updateField('seccion', event.target.value)}
                  placeholder="Ej: 4"
                  className="form-input"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {COMMERCIAL_SECTIONS.slice(0, 9).map((section) => (
                    <button
                      key={section}
                      type="button"
                      onClick={() => updateField('seccion', String(section))}
                      className="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                      style={{
                        border: '1px solid var(--card-border)',
                        color:
                          form.seccion === String(section)
                            ? 'var(--primary-light)'
                            : 'var(--foreground-muted)',
                        borderColor:
                          form.seccion === String(section)
                            ? 'rgba(37, 99, 235, 0.55)'
                            : 'var(--card-border)',
                      }}
                    >
                      {section}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className="text-xs"
                    style={{ color: 'var(--foreground-dim)' }}
                  >
                    AWG:
                  </span>
                  {AWG_PRESETS.map((awg) => (
                    <button
                      key={awg.label}
                      type="button"
                      onClick={() => updateField('seccion', String(awg.mm2))}
                      title={`${awg.label} AWG ≈ ${awg.mm2} mm²`}
                      aria-label={`${awg.label} AWG, ${awg.mm2} milímetros cuadrados`}
                      className="rounded-md px-2 py-1 text-xs font-medium transition-colors"
                      style={{
                        border: '1px solid var(--card-border)',
                        color:
                          selectedAwg?.label === awg.label
                            ? 'var(--warning)'
                            : 'var(--foreground-muted)',
                        borderColor:
                          selectedAwg?.label === awg.label
                            ? 'rgba(245, 158, 11, 0.55)'
                            : 'var(--card-border)',
                      }}
                    >
                      {formatAwg(awg)}
                    </button>
                  ))}
                </div>
                <p
                  className="mt-2 text-[11px]"
                  style={{ color: 'var(--foreground-dim)' }}
                >
                  Al elegir un AWG se carga su área comercial en mm².
                </p>
              </div>

              <div>
                <label htmlFor="L" className="form-label">
                  Longitud máxima (L) en metros
                </label>
                <input
                  type="number"
                  id="L"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={form.longitudMaxima}
                  onChange={(event) =>
                    updateField('longitudMaxima', event.target.value)
                  }
                  placeholder="Ej: 30"
                  className="form-input"
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
                  value={form.corriente}
                  onChange={(event) =>
                    updateField('corriente', event.target.value)
                  }
                  placeholder="Ej: 20"
                  className="form-input"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="btn btn-primary w-full sm:w-auto disabled:opacity-50"
                  disabled={vp === null}
                >
                  <Save className="h-4 w-4" aria-hidden />
                  Guardar cálculo
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
                history.items.map((item) => (
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
                          style={{
                            color: item.cumple
                              ? 'var(--success)'
                              : 'var(--danger)',
                          }}
                        >
                          {item.vp.toFixed(2)} V · {item.porcentaje.toFixed(2)} %
                        </p>
                        <p
                          className="text-xs sm:text-sm"
                          style={{ color: 'var(--foreground-muted)' }}
                        >
                          S: {sectionLabel(item.seccion)} · L: {item.longitudMaxima} m · I:{' '}
                          {item.corriente} A ({systemLabel(item.tipoSistema)})
                        </p>
                        <p
                          className="mt-1 text-xs"
                          style={{ color: 'var(--foreground-dim)' }}
                        >
                          {item.cumple
                            ? 'Cumple el límite de 3 %'
                            : 'Supera el límite de 3 %'}
                        </p>
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
                ))
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resultados y Gráfico */}
        <div className="md:col-span-3">
          <DonationSupportCard
            tool="caida-tension"
            hasResult={vp !== null}
            className="mb-6"
          />

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

            {vp === null && !error && (
              <p
                className="py-8 text-center"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Ingresa sección, longitud y corriente para ver el resultado y el
                gráfico.
              </p>
            )}

            {vp !== null && porcentaje !== null && cumple !== null && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: cumple ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    {vp.toFixed(2)} V
                  </span>
                  <span
                    className="text-lg"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    ({porcentaje.toFixed(2)} % de{' '}
                    {nominalVoltage(form.tipoSistema)} V)
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span
                    className={`badge ${
                      cumple ? 'badge-success' : 'badge-danger'
                    }`}
                  >
                    {cumple
                      ? `Cumple el límite de ${Math.round(
                          MAX_VOLTAGE_DROP_RATIO * 100
                        )} %`
                      : `Supera el límite de ${Math.round(
                          MAX_VOLTAGE_DROP_RATIO * 100
                        )} %`}
                  </span>
                  <span className="badge badge-primary">
                    Límite: {limiteV.toFixed(2)} V
                  </span>
                  {longitudMaxima !== null && (
                    <span className="badge badge-warning">
                      Longitud máxima: {longitudMaxima.toFixed(2)} m
                    </span>
                  )}
                  {selectedAwg !== null && (
                    <span className="badge badge-success">
                      Equivale a {formatAwg(selectedAwg)} ({selectedAwg.mm2} mm²)
                    </span>
                  )}
                </div>

                {!cumple && (
                  <p
                    className="text-center text-sm"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    Necesitas una sección mayor o acortar el tramo.{' '}
                    <Link
                      href={seccionHref}
                      className="underline"
                      style={{ color: 'var(--secondary)' }}
                    >
                      Calcular la sección necesaria
                    </Link>
                    .
                  </p>
                )}
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

            <div className="mt-6">
              {chart ? (
                <Line data={chart.data} options={chart.options} />
              ) : (
                <div
                  className="py-8 text-center text-sm"
                  style={{ color: 'var(--foreground-dim)' }}
                >
                  El gráfico aparecerá cuando los datos sean válidos.
                </div>
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
