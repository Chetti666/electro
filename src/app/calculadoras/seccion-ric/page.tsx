'use client';

import { useState, useMemo, FormEvent } from 'react';
import Link from 'next/link';
import { datosConductores, tablasDeCalculo, metodosInstalacion } from './data';

interface Resultado {
  seccion: number;
  equivalente: string;
  corrienteMaxima: number;
  tablaRef: string;
}

export default function SeccionRicPage() {
  // --- ESTADOS ---
  const [selectedConductorId, setSelectedConductorId] = useState('');
  const [corriente, setCorriente] = useState('');
  const [metodo, setMetodo] = useState('B1');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- DATOS DERIVADOS ---
  const sortedConductorKeys = useMemo(() => Object.keys(datosConductores).sort(), []);
  const selectedConductor = useMemo(() => {
    return selectedConductorId ? datosConductores[selectedConductorId] : null;
  }, [selectedConductorId]);

  const tieneTabla = selectedConductor?.tabla_ref && selectedConductor.tabla_ref !== 'SinTabla';

  // --- MANEJADORES DE EVENTOS ---
  const handleConductorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedConductorId(newId);
    // Resetear al cambiar de conductor
    setResultado(null);
    setError(null);
    setCorriente('');
    // Ajustar método por defecto si es necesario
    if (datosConductores[newId]?.tabla_ref === 'movil') {
      setMetodo('E');
    } else {
      setMetodo('B1');
    }
  };

  const handleCalcular = (e: FormEvent) => {
    e.preventDefault();
    setResultado(null);
    setError(null);

    const corrienteNum = parseFloat(corriente);
    if (!corrienteNum || corrienteNum <= 0) {
      setError("Por favor, ingrese un valor de corriente válido.");
      return;
    }

    if (!selectedConductor || !tieneTabla) {
      setError("Seleccione un conductor con tabla de cálculo.");
      return;
    }

    const tablaDeCalculo = tablasDeCalculo[selectedConductor.tabla_ref];
    const metodoActual = selectedConductor.tabla_ref === 'movil' ? 'E' : metodo;

    const seccionEncontrada = tablaDeCalculo.find(
      (c) => c[metodoActual] !== undefined && typeof c[metodoActual] === 'number' && c[metodoActual] >= corrienteNum
    );

    if (seccionEncontrada) {
      const textoAWG = seccionEncontrada.awg ? ` (${seccionEncontrada.awg} AWG)` : '';
      const textoKcmil = seccionEncontrada.kcmil ? ` (${seccionEncontrada.kcmil} kcmil)` : '';

      setResultado({
        seccion: seccionEncontrada.seccion_mm2,
        equivalente: textoAWG + textoKcmil,
        corrienteMaxima: seccionEncontrada[metodoActual] as number,
        tablaRef: selectedConductor.tabla_ref === 'movil' ? '4.5' : '4.4',
      });
    } else {
      setError(`No se encontró un conductor para ${corrienteNum} A con el método ${metodoActual}. La corriente podría ser demasiado alta.`);
    }
  };

  // --- RENDERIZADO ---
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Corriente Admisible de Conductores (RIC)</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Determina la sección de conductor según su tipo, método de instalación y la norma RIC N°4.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna de Formulario y Detalles */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Calculadora</h2>
            <form onSubmit={handleCalcular} className="space-y-6">
              <div>
                <label htmlFor="conductorSelect" className="form-label">1. Seleccione el Conductor</label>
                <select id="conductorSelect" value={selectedConductorId} onChange={handleConductorChange} className="form-select">
                  <option value="">-- Elija un tipo de conductor --</option>
                  {sortedConductorKeys.map(key => (
                    <option key={key} value={key}>{datosConductores[key].nombre}</option>
                  ))}
                </select>
              </div>

              {selectedConductor && tieneTabla && (
                <>
                  <div>
                    <label htmlFor="corriente" className="form-label">2. Ingrese la Corriente del Circuito (Amperes)</label>
                    <input type="number" id="corriente" value={corriente} onChange={(e) => setCorriente(e.target.value)} placeholder="Ej: 25" min="1" className="form-input" />
                  </div>

                  <div>
                    <label htmlFor="metodoInstalacion" className="form-label">3. Seleccione el Método de Instalación</label>
                    <select
                      id="metodoInstalacion"
                      value={metodo}
                      onChange={(e) => setMetodo(e.target.value)}
                      className="form-select disabled:bg-gray-100 dark:disabled:bg-gray-700"
                      disabled={selectedConductor.tabla_ref === 'movil'}
                    >
                      {selectedConductor.tabla_ref === 'movil'
                        ? <option value="E">{metodosInstalacion.find(m => m.id === 'E')?.label}</option>
                        : metodosInstalacion.map(m => (
                            <option key={m.id} value={m.id}>{m.label}</option>
                          ))}
                    </select>
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="btn btn-primary">Calcular Sección</button>
                  </div>
                </>
              )}
            </form>
          </div>

          {selectedConductor && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Detalles de {selectedConductor.nombre}</h2>
              <ul className="space-y-2 text-sm">
                <li><strong>Características:</strong> {selectedConductor.caracteristicas}</li>
                <li><strong>Uso Principal:</strong> {selectedConductor.uso}</li>
                <li><strong>Temp. Máxima:</strong> {selectedConductor.tempMax}</li>
                <li><strong>Aislamiento:</strong> {selectedConductor.aislamiento}</li>
                <li><strong>Cubierta:</strong> {selectedConductor.cubierta}</li>
                <li><strong>Tensión de Servicio:</strong> {selectedConductor.tension}</li>
              </ul>
              {!tieneTabla && (
                <p className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded-md">
                  Este conductor no tiene una tabla de cálculo de capacidad de corriente asociada en la norma.
                </p>
              )}
            </div>
          )}

          {(resultado || error) && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Resultado del Cálculo</h2>
              {error && <div className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md">{error}</div>}
              {resultado && (
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-md text-center">
                  <p className="text-sm">(Ref. Tabla N° {resultado.tablaRef} RIC N° 04)</p>
                  <p className="mt-2">Para una corriente de <strong>{corriente} A</strong>, la sección mínima es:</p>
                  <p className="text-3xl font-bold my-2">{resultado.seccion} mm²<span className="text-xl">{resultado.equivalente}</span></p>
                  <p className="text-sm">Soportando una corriente máx. de: <strong>{resultado.corrienteMaxima} A</strong></p>
                  <em className="text-xs mt-4 block">Nota: Siempre verifique las condiciones específicas de instalación y normativas locales.</em>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna de Información */}
        <div className="space-y-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Secciones Mínimas (RIC N°4)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Tipo de Circuito</th>
                    <th className="px-4 py-2">Sección Mínima</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-gray-700">
                    <td className="px-4 py-2">Iluminación</td>
                    <td className="px-4 py-2"><strong>1.5 mm²</strong></td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="px-4 py-2">Enchufes</td>
                    <td className="px-4 py-2"><strong>2.5 mm²</strong></td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="px-4 py-2">Mixtos</td>
                    <td className="px-4 py-2"><strong>2.5 mm²</strong></td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="px-4 py-2">Subalimentadores</td>
                    <td className="px-4 py-2"><strong>2.5 mm²</strong></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Alimentadores</td>
                    <td className="px-4 py-2"><strong>4.0 mm²</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Métodos de Instalación</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Método</th>
                    <th className="px-4 py-2">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {metodosInstalacion.map((m, index) => (
                    <tr key={m.id} className={index < metodosInstalacion.length - 1 ? 'border-b dark:border-gray-700' : ''}>
                      <td className="px-4 py-2"><strong>{m.id}</strong></td>
                      <td className="px-4 py-2">{m.label.split(': ')[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
