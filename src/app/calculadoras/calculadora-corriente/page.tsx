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
  apparentPower,
  currentFromPower,
  powerFromCurrent,
  type ElectricalSystem,
} from '@/lib/electrical';

const FORM_KEY = 'vmelectric:calc:corriente:form:v1';
const HISTORY_KEY = 'vmelectric:calc:corriente:history:v1';

type Objective = 'corriente' | 'potencia';
type PowerUnit = 'W' | 'kW';

type CurrentForm = {
  calculoObjetivo: Objective;
  tipoSistema: ElectricalSystem;
  potencia: string;
  potenciaUnidad: PowerUnit;
  voltaje: string;
  corriente: string;
  cosPhi: string;
};

type CurrentHistoryItem = HistoryEntry & {
  calculoObjetivo: Objective;
  tipoSistema: ElectricalSystem;
  potencia: string;
  potenciaUnidad: PowerUnit;
  voltaje: string;
  corriente: string;
  cosPhi: string;
  valor: number;
  unidad: string;
  etiqueta: string;
  aparente: number;
};

const DEFAULT_FORM: CurrentForm = {
  calculoObjetivo: 'corriente',
  tipoSistema: 'monofasico',
  potencia: '',
  potenciaUnidad: 'W',
  voltaje: '',
  corriente: '',
  cosPhi: '1',
};

function toPositive(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function systemLabel(system: ElectricalSystem): string {
  return system === 'monofasico' ? 'Monofásico' : 'Trifásico';
}

export default function CalculadoraCorrientePage() {
  const [form, setForm] = usePersistentState<CurrentForm>(
    FORM_KEY,
    DEFAULT_FORM
  );
  const history = useCalculationHistory<CurrentHistoryItem>(HISTORY_KEY);
  const recordCalculation = useCalculationRecorder();

  const [saved, setSaved] = useState(false);
  const [lastCalculated, setLastCalculated] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const voltaje = toPositive(form.voltaje);
  const corriente = toPositive(form.corriente);
  const potenciaIngresada = toPositive(form.potencia);
  const potenciaW =
    potenciaIngresada !== null
      ? form.potenciaUnidad === 'kW'
        ? potenciaIngresada * 1000
        : potenciaIngresada
      : null;

  const cosPhi = Number.parseFloat(form.cosPhi.replace(',', '.'));
  const cosPhiValido = Number.isFinite(cosPhi) && cosPhi > 0 && cosPhi <= 1;

  const completo =
    form.voltaje.trim() !== '' &&
    form.cosPhi.trim() !== '' &&
    (form.calculoObjetivo === 'corriente'
      ? form.potencia.trim() !== ''
      : form.corriente.trim() !== '');

  const resultado = useMemo(() => {
    if (form.calculoObjetivo === 'corriente') {
      if (potenciaW === null || voltaje === null || !cosPhiValido) return null;
      const amperios = currentFromPower({
        system: form.tipoSistema,
        powerW: potenciaW,
        voltageV: voltaje,
        powerFactor: cosPhi,
      });
      if (!Number.isFinite(amperios) || amperios <= 0) return null;
      return {
        valor: amperios,
        unidad: 'A',
        etiqueta: 'Corriente (I)',
        potenciaW,
        aparente: apparentPower(potenciaW, cosPhi),
      };
    }

    if (corriente === null || voltaje === null || !cosPhiValido) return null;
    const watts = powerFromCurrent({
      system: form.tipoSistema,
      currentA: corriente,
      voltageV: voltaje,
      powerFactor: cosPhi,
    });
    if (!Number.isFinite(watts) || watts <= 0) return null;
    return {
      valor: watts,
      unidad: 'W',
      etiqueta: 'Potencia activa (P)',
      potenciaW: watts,
      aparente: apparentPower(watts, cosPhi),
    };
  }, [
    form.calculoObjetivo,
    form.tipoSistema,
    potenciaW,
    voltaje,
    corriente,
    cosPhi,
    cosPhiValido,
  ]);

  const validos = resultado !== null;

  const error = completo && !validos
    ? !cosPhiValido
      ? 'El factor de potencia debe ser mayor que 0 y menor o igual a 1.'
      : 'Todos los valores deben ser números mayores que cero.'
    : null;

  // El botón dice «Calcular» hasta que se calcula; después «Guardar cálculo».
  // Al cambiar o limpiar los datos vuelve a «Calcular».
  const formSignature = [
    form.calculoObjetivo,
    form.tipoSistema,
    form.potencia,
    form.potenciaUnidad,
    form.voltaje,
    form.corriente,
    form.cosPhi,
  ].join('|');
  const yaCalculado = resultado !== null && lastCalculated === formSignature;

  const resumen = resultado
    ? [
        `${resultado.etiqueta}: ${resultado.valor.toFixed(2)} ${resultado.unidad}`,
        `Potencia: ${(resultado.potenciaW / 1000).toFixed(2)} kW · Aparente: ${(
          resultado.aparente / 1000
        ).toFixed(2)} kVA`,
        `${systemLabel(form.tipoSistema)} · V: ${form.voltaje} V · FP: ${form.cosPhi}`,
        'Calculado con VMElectric',
      ].join('\n')
    : '';

  const updateField = <K extends keyof CurrentForm>(
    field: K,
    value: CurrentForm[K]
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const changeSystem = (system: ElectricalSystem) => {
    setForm((previous) => ({
      ...previous,
      tipoSistema: system,
      cosPhi: system === 'monofasico' ? '1' : '0.93',
    }));
  };

  const handleCalcular = (event: FormEvent) => {
    event.preventDefault();
    if (!resultado) return;

    const latest = history.items[0];
    const duplicate =
      latest !== undefined &&
      latest.calculoObjetivo === form.calculoObjetivo &&
      latest.tipoSistema === form.tipoSistema &&
      latest.potencia === form.potencia &&
      latest.potenciaUnidad === form.potenciaUnidad &&
      latest.voltaje === form.voltaje &&
      latest.corriente === form.corriente &&
      latest.cosPhi === form.cosPhi;

    if (!duplicate) {
      history.add({
        calculoObjetivo: form.calculoObjetivo,
        tipoSistema: form.tipoSistema,
        potencia: form.potencia,
        potenciaUnidad: form.potenciaUnidad,
        voltaje: form.voltaje,
        corriente: form.corriente,
        cosPhi: form.cosPhi,
        valor: resultado.valor,
        unidad: resultado.unidad,
        etiqueta: resultado.etiqueta,
        aparente: resultado.aparente,
      });

      void recordCalculation({
        type: 'CORRIENTE_POTENCIA',
        title: `${resultado.etiqueta}: ${resultado.valor.toFixed(2)} ${
          resultado.unidad
        }`,
        input: {
          calculoObjetivo: form.calculoObjetivo,
          tipoSistema: form.tipoSistema,
          potencia: potenciaW !== null ? String(potenciaW) : form.potencia,
          voltaje: form.voltaje,
          corriente: form.corriente,
          cosPhi: form.cosPhi,
        },
        result: {
          valor: resultado.valor,
          unidad: resultado.unidad,
          etiqueta: resultado.etiqueta,
        },
      });
    }

    setLastCalculated(formSignature);

    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2200);
  };

  const resetFields = () => {
    setForm((previous) => ({
      ...previous,
      potencia: '',
      corriente: '',
      voltaje: '',
    }));
  };

  const restore = (item: CurrentHistoryItem) => {
    setForm({
      calculoObjetivo: item.calculoObjetivo,
      tipoSistema: item.tipoSistema,
      potencia: item.potencia,
      potenciaUnidad: item.potenciaUnidad,
      voltaje: item.voltaje,
      corriente: item.corriente,
      cosPhi: item.cosPhi,
    });
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 md:pt-32">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          Calculadora de Corriente y Potencia
        </h1>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Calcula la corriente (A) o la potencia (W) para sistemas monofásicos y
          trifásicos. El resultado se actualiza mientras escribes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna del Formulario */}
        <div className="card">
          <h2
            className="text-lg sm:text-xl font-semibold mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            Datos de entrada
          </h2>
          <form onSubmit={handleCalcular} className="space-y-4">
            <div>
              <label htmlFor="objetivo" className="form-label">
                1. ¿Qué deseas calcular?
              </label>
              <select
                id="objetivo"
                value={form.calculoObjetivo}
                onChange={(event) =>
                  updateField(
                    'calculoObjetivo',
                    event.target.value as Objective
                  )
                }
                className="form-select"
              >
                <option value="corriente">Corriente (Amperes)</option>
                <option value="potencia">Potencia (Watts)</option>
              </select>
            </div>

            <div>
              <label htmlFor="tipoSistema" className="form-label">
                2. Tipo de sistema
              </label>
              <select
                id="tipoSistema"
                value={form.tipoSistema}
                onChange={(event) =>
                  changeSystem(event.target.value as ElectricalSystem)
                }
                className="form-select"
              >
                <option value="monofasico">Monofásico </option>
                <option value="trifasico">Trifásico </option>
              </select>
            </div>

            {form.calculoObjetivo === 'corriente' ? (
              <div>
                <label htmlFor="P" className="form-label">
                  3. Potencia activa (P)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="P"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    placeholder={form.potenciaUnidad === 'kW' ? 'Ej: 1.5' : 'Ej: 1500'}
                    value={form.potencia}
                    onChange={(event) =>
                      updateField('potencia', event.target.value)
                    }
                    className="form-input"
                  />
                  <div className="flex shrink-0 overflow-hidden rounded-lg"
                    style={{ border: '1px solid var(--card-border)' }}
                  >
                    {(['W', 'kW'] as const).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => updateField('potenciaUnidad', unit)}
                        className="px-3 py-2 text-xs font-semibold transition-colors"
                        style={{
                          background:
                            form.potenciaUnidad === unit
                              ? 'rgba(37, 99, 235, 0.18)'
                              : 'transparent',
                          color:
                            form.potenciaUnidad === unit
                              ? 'var(--primary-light)'
                              : 'var(--foreground-muted)',
                        }}
                        aria-pressed={form.potenciaUnidad === unit}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="I" className="form-label">
                  3. Corriente (I) en Amperios
                </label>
                <input
                  type="number"
                  id="I"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  placeholder="Ej: 10"
                  value={form.corriente}
                  onChange={(event) =>
                    updateField('corriente', event.target.value)
                  }
                  className="form-input"
                />
              </div>
            )}

            <div>
              <label htmlFor="V" className="form-label">
                4. Voltaje (V)
              </label>
              <input
                type="number"
                id="V"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Ej: 220"
                value={form.voltaje}
                onChange={(event) => updateField('voltaje', event.target.value)}
                className="form-input"
              />
              <div className="mt-2 flex gap-1.5">
                {[220, 380].map((voltage) => (
                  <button
                    key={voltage}
                    type="button"
                    onClick={() => updateField('voltaje', String(voltage))}
                    className="rounded-md px-2 py-1 text-xs font-medium"
                    style={{
                      border: '1px solid var(--card-border)',
                      color:
                        form.voltaje === String(voltage)
                          ? 'var(--primary-light)'
                          : 'var(--foreground-muted)',
                      borderColor:
                        form.voltaje === String(voltage)
                          ? 'rgba(37, 99, 235, 0.55)'
                          : 'var(--card-border)',
                    }}
                  >
                    {voltage} V
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="cosPhi" className="form-label">
                5. Factor de potencia (cosφ)
              </label>
              <input
                type="number"
                id="cosPhi"
                inputMode="decimal"
                step="0.01"
                min="0"
                max="1"
                value={form.cosPhi}
                onChange={(event) => updateField('cosPhi', event.target.value)}
                className="form-input"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[1, 0.93, 0.9, 0.85].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateField('cosPhi', String(value))}
                    className="rounded-md px-2 py-1 text-xs font-medium"
                    style={{
                      border: '1px solid var(--card-border)',
                      color:
                        form.cosPhi === String(value)
                          ? 'var(--primary-light)'
                          : 'var(--foreground-muted)',
                      borderColor:
                        form.cosPhi === String(value)
                          ? 'rgba(37, 99, 235, 0.55)'
                          : 'var(--card-border)',
                    }}
                  >
                    {value.toLocaleString('es-CL')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto disabled:opacity-50"
                disabled={!validos}
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

        {/* Columna de Resultados e Historial */}
        <div className="space-y-6">
          <DonationSupportCard
            tool="calculadora-corriente"
            hasResult={validos}
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

            {!resultado && !error && (
              <div className="text-center py-8">
                <p style={{ color: 'var(--foreground-muted)' }}>
                  Completa los datos para ver el resultado.
                </p>
              </div>
            )}

            {resultado && (
              <div className="space-y-4">
                <div
                  className="rounded-lg p-4 text-center"
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                  }}
                >
                  <p
                    className="text-base sm:text-lg"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {resultado.etiqueta}
                  </p>
                  <p
                    className="text-2xl sm:text-3xl font-bold"
                    style={{ color: 'var(--success)' }}
                  >
                    {resultado.valor.toFixed(2)} {resultado.unidad}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="badge badge-primary">
                    Potencia: {(resultado.potenciaW / 1000).toFixed(2)} kW
                  </span>
                  <span className="badge badge-warning">
                    Aparente: {(resultado.aparente / 1000).toFixed(2)} kVA
                  </span>
                  <span className="badge badge-success">
                    {systemLabel(form.tipoSistema)} · FP {form.cosPhi}
                  </span>
                </div>
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

          {/* Historial */}
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
                          style={{ color: 'var(--primary-light)' }}
                        >
                          {item.valor.toFixed(2)} {item.unidad}
                        </p>
                        <p
                          className="text-xs sm:text-sm"
                          style={{ color: 'var(--foreground-muted)' }}
                        >
                          {item.etiqueta} · {systemLabel(item.tipoSistema)}
                        </p>
                        <p
                          className="mt-1 text-xs"
                          style={{ color: 'var(--foreground-dim)' }}
                        >
                          {item.calculoObjetivo === 'corriente'
                            ? `P: ${item.potencia} ${item.potenciaUnidad}`
                            : `I: ${item.corriente} A`}{' '}
                          · V: {item.voltaje} V · FP: {item.cosPhi}
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
