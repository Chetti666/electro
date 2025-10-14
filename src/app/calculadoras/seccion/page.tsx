'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function CalculoSeccionPage() {
  // Estados para los campos del formulario
  const [longitud, setLongitud] = useState('');
  const [corriente, setCorriente] = useState('');
  const [caidaTension, setCaidaTension] = useState('');
  const [tipoSistema, setTipoSistema] = useState('monofasico');

  // Estados para los resultados
  const [resultado, setResultado] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      // Fórmula S1 (Monofásica)
      calculo = (2 * 0.018 * L * I) / Vp;
    } else {
      // Fórmula S3 (Trifásica)
      calculo = (Math.sqrt(3) * 0.018 * L * I) / Vp;
    }

    setResultado(calculo);
  };

  // Función para generar reporte
  const generarReporte = () => {
    alert('Funcionalidad de reporte en desarrollo');
  };

  // Función para guardar proyecto
  const guardarProyecto = () => {
    alert('Funcionalidad de guardar proyecto en desarrollo');
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
              {/* Tipo de Sistema */}
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

              {/* Longitud */}
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

              {/* Corriente */}
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

              {/* Caída de Tensión */}
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
                <button type="button" onClick={generarReporte} className="btn btn-secondary">
                  Generar reporte
                </button>
                <button type="button" onClick={guardarProyecto} className="btn btn-outline">
                  Guardar proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Resultados */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Resultados</h2>

            {/* Mensaje inicial */}
            {!resultado && !error && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Complete el formulario y haga clic en &quot;Calcular&quot; para ver los resultados.</p>
              </div>
            )}

            {/* Muestra de resultado */}
            {resultado !== null && (
              <div className="mt-6 text-center bg-green-100 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-lg text-gray-800 dark:text-gray-200">La sección del conductor requerida es:</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">{resultado.toFixed(4)} mm²</p>
              </div>
            )}
            {/* Muestra de error */}
            {error && <div className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</div>}
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
