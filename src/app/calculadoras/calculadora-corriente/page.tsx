'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

type TipoSistema = 'monofasico' | 'trifasico';

type HistoryItem = {
  id: number;
  inputs: {
    calculoObjetivo: 'corriente' | 'potencia';
    tipoSistema: TipoSistema;
    potencia: string;
    voltaje: string;
    corriente: string;
    cosPhi: string;
  };
  resultado: { valor: number; unidad: string; etiqueta: string };
};

export default function CalculadoraCorrientePage() {
  const [calculoObjetivo, setCalculoObjetivo] = useState<'corriente' | 'potencia'>('corriente');
  const [tipoSistema, setTipoSistema] = useState<TipoSistema>('monofasico');
  const [potencia, setPotencia] = useState<string>('');
  const [voltaje, setVoltaje] = useState<string>('');
  const [corriente, setCorriente] = useState<string>('');
  const [cosPhi, setCosPhi] = useState<string>('1');
  const [resultado, setResultado] = useState<{ valor: number; unidad: string; etiqueta: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (tipoSistema === 'monofasico') {
      setCosPhi('1');
    } else {
      setCosPhi('0.93');
    }
    setResultado(null);
    setError(null);
  }, [tipoSistema, calculoObjetivo]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultado(null);

    const V = parseFloat(voltaje);
    const cosPhiValue = parseFloat(cosPhi);
    let P: number, I: number;
    let resultadoCalculado: { valor: number; unidad: string; etiqueta: string } | null = null;

    if (calculoObjetivo === 'corriente') {
      P = parseFloat(potencia);
      if (isNaN(P) || isNaN(V) || isNaN(cosPhiValue)) {
        setError("Por favor, ingrese todos los valores numéricos.");
        return;
      }
      if (V === 0 || cosPhiValue === 0) {
        setError("El Voltaje y el Factor de Potencia no pueden ser cero para calcular la corriente.");
        return;
      }
      let valor = 0;
      if (tipoSistema === 'monofasico') {
        valor = P / (V * cosPhiValue);
      } else {
        valor = P / (V * Math.sqrt(3) * cosPhiValue);
      }
      resultadoCalculado = { valor, unidad: 'A', etiqueta: 'Corriente (I)' };

    } else {
      I = parseFloat(corriente);
      if (isNaN(I) || isNaN(V) || isNaN(cosPhiValue)) {
        setError("Por favor, ingrese todos los valores numéricos.");
        return;
      }
      let valor = 0;
      if (tipoSistema === 'monofasico') {
        valor = I * V * cosPhiValue;
      } else {
        valor = I * V * Math.sqrt(3) * cosPhiValue;
      }
      resultadoCalculado = { valor, unidad: 'W', etiqueta: 'Potencia Activa (P)' };
    }

    if (resultadoCalculado) {
      setResultado(resultadoCalculado);
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        inputs: { calculoObjetivo, tipoSistema, potencia, voltaje, corriente, cosPhi },
        resultado: resultadoCalculado,
      };
      setHistory([newHistoryItem, ...history]);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const labelPotencia = tipoSistema === 'monofasico' ? 'Potencia (P):' : 'Potencia Activa (P):';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Calculadora de Corriente y Potencia</h1>
        <p className="text-gray-600 dark:text-gray-400">Calcula la corriente (A) o la potencia (W) para sistemas monofásicos y trifásicos.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna del Formulario */}
        <div className="card">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Datos de entrada</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">1. ¿Qué desea calcular?</label>
              <select value={calculoObjetivo} onChange={(e) => setCalculoObjetivo(e.target.value as 'corriente' | 'potencia')} className="form-select">
                <option value="corriente">Corriente (Amperes)</option>
                <option value="potencia">Potencia (Watts)</option>
              </select>
            </div>
            <div>
              <label htmlFor="tipoSistema" className="form-label">2. Tipo de Sistema</label>
              <select
                id="tipoSistema"
                value={tipoSistema}
                onChange={(e) => setTipoSistema(e.target.value as TipoSistema)}
                className="form-select"
              >
                <option value="monofasico">Monofásico</option>
                <option value="trifasico">Trifásico</option>
              </select>
            </div>

            {calculoObjetivo === 'corriente' ? (
              <div>
                <label htmlFor="P" className="form-label">3. {labelPotencia}</label>
                <input type="number" id="P" placeholder="Watts" value={potencia} onChange={(e) => setPotencia(e.target.value)} className="form-input" required />
              </div>
            ) : (
              <div>
                <label htmlFor="I" className="form-label">3. Corriente (I)</label>
                <input type="number" id="I" placeholder="Amperes" value={corriente} onChange={(e) => setCorriente(e.target.value)} className="form-input" required />
              </div>
            )}

            <div>
              <label htmlFor="V" className="form-label">4. Voltaje (V)</label>
              <input type="number" id="V" placeholder="Volts" value={voltaje} onChange={(e) => setVoltaje(e.target.value)} className="form-input" required />
            </div>

            <div>
              <label htmlFor="cosPhi" className="form-label">5. Factor de Potencia (cosφ)</label>
              <input type="number" id="cosPhi" step="0.01" min="0" max="1" value={cosPhi} onChange={(e) => setCosPhi(e.target.value)} className="form-input" required />
            </div>

            <div className="pt-4">
              <button type="submit" className="btn btn-primary w-full sm:w-auto">Calcular</button>
            </div>
          </form>
        </div>

        {/* Columna de Resultados e Historial */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Resultados</h2>
            {!resultado && !error && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Complete el formulario para ver los resultados.</p>
              </div>
            )}

            {resultado !== null && (
              <div className="mt-6 text-center bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200">El resultado para {resultado.etiqueta} es:</p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400">{resultado.valor.toFixed(2)} {resultado.unidad}</p>
              </div>
            )}

            {error && <div className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</div>}
          </div>

          {/* Historial */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Historial</h2>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-sm text-blue-500 hover:underline">
                  Limpiar
                </button>
              )}
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {history.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay cálculos guardados.</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                    <p className="font-semibold text-base sm:text-md text-blue-600 dark:text-blue-400">
                      {item.resultado.valor.toFixed(2)} {item.resultado.unidad}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Calculado: {item.inputs.calculoObjetivo === 'corriente' ? 'Corriente' : 'Potencia'} ({item.inputs.tipoSistema})
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {item.inputs.calculoObjetivo === 'corriente' 
                        ? `P: ${item.inputs.potencia}W, V: ${item.inputs.voltaje}V` 
                        : `I: ${item.inputs.corriente}A, V: ${item.inputs.voltaje}V`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6">
            <Link href="/calculadoras" className="text-amber-500 hover:text-amber-600 inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a calculadoras
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}