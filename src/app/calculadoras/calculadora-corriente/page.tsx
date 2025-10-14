'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

type TipoSistema = 'monofasico' | 'trifasico';

export default function CalculadoraCorrientePage() {
  const [calculoObjetivo, setCalculoObjetivo] = useState<'corriente' | 'potencia'>('corriente');
  const [tipoSistema, setTipoSistema] = useState<TipoSistema>('monofasico');
  const [potencia, setPotencia] = useState<string>('');
  const [voltaje, setVoltaje] = useState<string>('');
  const [corriente, setCorriente] = useState<string>('');
  const [cosPhi, setCosPhi] = useState<string>('1');
  const [resultado, setResultado] = useState<{ valor: number; unidad: string; etiqueta: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Efecto para actualizar campos dinámicos cuando cambia el tipo de sistema
  useEffect(() => {
    if (tipoSistema === 'monofasico') {
      setCosPhi('1');
    } else { // trifasico
      setCosPhi('0.93');
    }
    // Reseteamos el resultado al cambiar de sistema
    setResultado(null);
    setError(null);
  }, [tipoSistema, calculoObjetivo]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario
    setError(null);
    setResultado(null);

    const V = parseFloat(voltaje);
    const cosPhiValue = parseFloat(cosPhi);
    let P: number, I: number;
    let resultadoCalculado = 0;

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
      if (tipoSistema === 'monofasico') {
        resultadoCalculado = P / (V * cosPhiValue);
      } else { // trifasico
        resultadoCalculado = P / (V * Math.sqrt(3) * cosPhiValue);
      }
      setResultado({ valor: resultadoCalculado, unidad: 'A', etiqueta: 'Corriente (I)' });

    } else { // calculoObjetivo === 'potencia'
      I = parseFloat(corriente);
      if (isNaN(I) || isNaN(V) || isNaN(cosPhiValue)) {
        setError("Por favor, ingrese todos los valores numéricos.");
        return;
      }
      if (tipoSistema === 'monofasico') {
        resultadoCalculado = I * V * cosPhiValue;
      } else { // trifasico
        resultadoCalculado = I * V * Math.sqrt(3) * cosPhiValue;
      }
      setResultado({ valor: resultadoCalculado, unidad: 'W', etiqueta: 'Potencia Activa (P)' });
    }
  };

  const labelPotencia = tipoSistema === 'monofasico' ? 'Potencia (P):' : 'Potencia Activa (P):';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Calculadora de Corriente y Potencia</h1>
        <p className="text-gray-600 dark:text-gray-400">Calcula la corriente (A) o la potencia (W) para sistemas monofásicos y trifásicos.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna del Formulario */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Datos de entrada</h2>
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

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="btn btn-primary">Calcular</button>
              </div>
            </form>
          </div>
        </div>

        {/* Columna de Resultados */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Resultados</h2>

            {!resultado && !error && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Complete el formulario y haga clic en "Calcular" para ver los resultados.</p>
              </div>
            )}

            {resultado !== null && (
              <div className="mt-6 text-center bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <p className="text-lg text-gray-800 dark:text-gray-200">El resultado para {resultado.etiqueta} es:</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{resultado.valor.toFixed(2)} {resultado.unidad}</p>
              </div>
            )}

            {error && <div className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</div>}
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