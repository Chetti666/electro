'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

// Definición del tipo para cada entrada en el historial
type HistoryItem = {
  longitud: string;
  corriente: string;
  caidaTension: string;
  tipoSistema: string;
  resultado: number;
  id: number;
};

export default function CalculoSeccionPage() {
  // Estados para los campos del formulario
  const [longitud, setLongitud] = useState('');
  const [corriente, setCorriente] = useState('');
  const [caidaTension, setCaidaTension] = useState('');
  const [tipoSistema, setTipoSistema] = useState('monofasico');

  // Estados para los resultados y el historial
  const [resultado, setResultado] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Función para calcular
  const handleCalcular = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultado(null);

    const L = parseFloat(longitud);
    const I = parseFloat(corriente);
    const Vp = parseFloat(caidaTension);

    if (isNaN(L) || isNaN(I) || isNaN(Vp)) {
      setError('Por favor, ingrese todos los valores numéricos.');
      return;
    }

    if (Vp === 0) {
      setError('La caída de tensión (Vp) no puede ser cero.');
      return;
    }

    let calculo = 0;
    if (tipoSistema === 'monofasico') {
      calculo = (2 * 0.018 * L * I) / Vp;
    } else {
      calculo = (Math.sqrt(3) * 0.018 * L * I) / Vp;
    }

    setResultado(calculo);

    // Añadir al historial
    const newHistoryItem: HistoryItem = {
      longitud,
      corriente,
      caidaTension,
      tipoSistema,
      resultado: calculo,
      id: Date.now(), // ID simple basado en el tiempo
    };
    setHistory([newHistoryItem, ...history]);
  };

  // Función para limpiar el historial
  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cálculo de Sección de Conductores</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Determina la sección adecuada de conductores en base a la corriente y caída de tensión.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Datos de entrada</h2>
            <form onSubmit={handleCalcular} className="space-y-4">
              {/* ... (campos del formulario sin cambios) ... */}
              <div>
                <label className="form-label">Tipo de Sistema</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="tipo_sistema"
                      value="monofasico"
                      checked={tipoSistema === 'monofasico'}
                      onChange={(e) => setTipoSistema(e.target.value)}
                    />
                    <span className="ml-2">Monofásico</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="tipo_sistema"
                      value="trifasico"
                      checked={tipoSistema === 'trifasico'}
                      onChange={(e) => setTipoSistema(e.target.value)}
                    />
                    <span className="ml-2">Trifásica</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="L" className="form-label">Longitud (L) en metros</label>
                <input
                  type="number"
                  id="L"
                  className="form-input"
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  placeholder="Ej: 50"
                />
              </div>

              <div>
                <label htmlFor="I" className="form-label">Corriente (I) en Amperios</label>
                <input
                  type="number"
                  id="I"
                  className="form-input"
                  value={corriente}
                  onChange={(e) => setCorriente(e.target.value)}
                  placeholder="Ej: 15"
                />
              </div>

              <div>
                <label htmlFor="Vp" className="form-label">Caída de Tensión (Vp) en Voltios</label>
                <input
                  type="number"
                  id="Vp"
                  className="form-input"
                  value={caidaTension}
                  onChange={(e) => setCaidaTension(e.target.value)}
                  placeholder="Ej: 6.9"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="btn btn-primary">
                  Calcular Sección
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Resultados e Historial */}
        <div className="space-y-6">
          {/* Resultados */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Resultados</h2>
            {!resultado && !error && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Complete el formulario y haga clic en &quot;Calcular&quot; para ver los resultados.</p>
              </div>
            )}
            {resultado !== null && (
              <div className="mt-6 text-center bg-green-100 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-lg text-gray-800 dark:text-gray-200">La sección del conductor requerida es:</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">{resultado.toFixed(4)} mm²</p>
              </div>
            )}
            {error && <div className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</div>}
          </div>

          {/* Historial de Cálculos */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Historial</h2>
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
                    <p className="font-semibold text-lg text-blue-600 dark:text-blue-400">{item.resultado.toFixed(4)} mm²</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      L: {item.longitud}m, I: {item.corriente}A, Vp: {item.caidaTension}V ({item.tipoSistema})
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6">
            <Link href="/calculadoras" className="text-emerald-500 hover:text-emerald-600 inline-flex items-center">
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
