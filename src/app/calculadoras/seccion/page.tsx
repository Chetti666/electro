'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CalculationResult {
  corrienteDiseño: number;
  seccionPorCorriente: number;
  seccionPorCaida: number;
  seccionRecomendada: number;
  capacidadConductor: number;
  caidaReal: number;
  id: number;
}

export default function CalculoSeccion() {
  // Estados para los campos del formulario
  const [tipoInstalacion, setTipoInstalacion] = useState('monofasica');
  const [potencia, setPotencia] = useState('');
  const [tension, setTension] = useState('');
  const [factorPotencia, setFactorPotencia] = useState('0.95');
  const [longitud, setLongitud] = useState('');
  const [material, setMaterial] = useState('cobre');
  const [aislamiento, setAislamiento] = useState('pvc');
  const [temperaturaAmbiente, setTemperaturaAmbiente] = useState('30');
  const [metodoInstalacion, setMetodoInstalacion] = useState('B1');
  const [caidaMaxima, setCaidaMaxima] = useState('3');
  
  // Estado para el resultado actual
  const [resultado, setResultado] = useState<CalculationResult | null>(null);
  
  // Estado para el historial de resultados
  const [historial, setHistorial] = useState<CalculationResult[]>([]);
  
  // Función para calcular
  const calcular = (e: React.FormEvent) => {
    e.preventDefault();
    
    const potenciaNum = parseFloat(potencia);
    const tensionNum = parseFloat(tension);
    const factorPotenciaNum = parseFloat(factorPotencia);
    
    let corriente = 0;
    if (tipoInstalacion === 'monofasica') {
      corriente = potenciaNum / (tensionNum * factorPotenciaNum);
    } else {
      corriente = potenciaNum / (Math.sqrt(3) * tensionNum * factorPotenciaNum);
    }
    
    const nuevoResultado: CalculationResult = {
      corrienteDiseño: corriente,
      seccionPorCorriente: 2.5, // Valor de ejemplo
      seccionPorCaida: 4, // Valor de ejemplo
      seccionRecomendada: 4, // Valor de ejemplo
      capacidadConductor: 32, // Valor de ejemplo
      caidaReal: 2.1, // Valor de ejemplo
      id: Date.now(),
    };
    
    setResultado(nuevoResultado);
  };

  const guardarResultado = () => {
    if (resultado) {
      setHistorial([resultado, ...historial]);
      alert('Resultado guardado en el historial.');
    }
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
          Determina la sección adecuada de conductores según la corriente y caída de tensión.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal: Formulario y Resultados */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Datos de entrada</h2>
            <form onSubmit={calcular} className="space-y-4">
              {/* ... (campos del formulario sin cambios) ... */}
               {/* Tipo de instalación */}
              <div>
                <label className="form-label">Tipo de instalación</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="tipoInstalacion"
                      value="monofasica"
                      checked={tipoInstalacion === 'monofasica'}
                      onChange={(e) => setTipoInstalacion(e.target.value)}
                    />
                    <span className="ml-2">Monofásica</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="tipoInstalacion"
                      value="trifasica"
                      checked={tipoInstalacion === 'trifasica'}
                      onChange={(e) => setTipoInstalacion(e.target.value)}
                    />
                    <span className="ml-2">Trifásica</span>
                  </label>
                </div>
              </div>
              
              {/* Potencia */}
              <div>
                <label htmlFor="potencia" className="form-label">Potencia (W)</label>
                <input
                  type="number"
                  id="potencia"
                  className="form-input"
                  value={potencia}
                  onChange={(e) => setPotencia(e.target.value)}
                  placeholder="Ej: 5000"
                  required
                />
              </div>
              
              {/* Tensión */}
              <div>
                <label htmlFor="tension" className="form-label">Tensión (V)</label>
                <input
                  type="number"
                  id="tension"
                  className="form-input"
                  value={tension}
                  onChange={(e) => setTension(e.target.value)}
                  placeholder={tipoInstalacion === 'monofasica' ? 'Ej: 230' : 'Ej: 400'}
                  required
                />
              </div>
              
              {/* Factor de potencia */}
              <div>
                <label htmlFor="factorPotencia" className="form-label">Factor de potencia</label>
                <input
                  type="number"
                  id="factorPotencia"
                  className="form-input"
                  value={factorPotencia}
                  onChange={(e) => setFactorPotencia(e.target.value)}
                  step="0.01"
                  min="0"
                  max="1"
                  required
                />
              </div>
              
              {/* Longitud */}
              <div>
                <label htmlFor="longitud" className="form-label">Longitud del cable (m)</label>
                <input
                  type="number"
                  id="longitud"
                  className="form-input"
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  placeholder="Ej: 25"
                  required
                />
              </div>
              
              {/* Material del conductor */}
              <div>
                <label htmlFor="material" className="form-label">Material del conductor</label>
                <select
                  id="material"
                  className="form-select"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  required
                >
                  <option value="cobre">Cobre</option>
                  <option value="aluminio">Aluminio</option>
                </select>
              </div>
              
              {/* Tipo de aislamiento */}
              <div>
                <label htmlFor="aislamiento" className="form-label">Tipo de aislamiento</label>
                <select
                  id="aislamiento"
                  className="form-select"
                  value={aislamiento}
                  onChange={(e) => setAislamiento(e.target.value)}
                  required
                >
                  <option value="pvc">PVC</option>
                  <option value="xlpe">XLPE</option>
                  <option value="epr">EPR</option>
                </select>
              </div>
              
              {/* Temperatura ambiente */}
              <div>
                <label htmlFor="temperaturaAmbiente" className="form-label">Temperatura ambiente (°C)</label>
                <input
                  type="number"
                  id="temperaturaAmbiente"
                  className="form-input"
                  value={temperaturaAmbiente}
                  onChange={(e) => setTemperaturaAmbiente(e.target.value)}
                  required
                />
              </div>
              
              {/* Método de instalación */}
              <div>
                <label htmlFor="metodoInstalacion" className="form-label">Método de instalación</label>
                <select
                  id="metodoInstalacion"
                  className="form-select"
                  value={metodoInstalacion}
                  onChange={(e) => setMetodoInstalacion(e.target.value)}
                  required
                >
                  <option value="A1">A1 - Conductores aislados en conducto en pared térmicamente aislante</option>
                  <option value="A2">A2 - Cable multiconductor en conducto en pared térmicamente aislante</option>
                  <option value="B1">B1 - Conductores aislados en conducto sobre pared de madera</option>
                  <option value="B2">B2 - Cable multiconductor en conducto sobre pared de madera</option>
                  <option value="C">C - Cable multiconductor directamente sobre pared</option>
                  <option value="D">D - Cable multiconductor en conductos enterrados</option>
                  <option value="E">E - Cable multiconductor al aire libre</option>
                  <option value="F">F - Cables unipolares en contacto al aire libre</option>
                </select>
              </div>
              
              {/* Caída de tensión máxima */}
              <div>
                <label htmlFor="caidaMaxima" className="form-label">Caída de tensión máxima (%)</label>
                <input
                  type="number"
                  id="caidaMaxima"
                  className="form-input"
                  value={caidaMaxima}
                  onChange={(e) => setCaidaMaxima(e.target.value)}
                  step="0.1"
                  min="0"
                  required
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="submit" className="btn btn-primary">
                  Calcular
                </button>
              </div>
            </form>
          </div>

          {/* Resultados */}
          {resultado && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Resultados del Cálculo</h2>
              <div className="space-y-4">
                 <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Corriente de diseño</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{resultado.corrienteDiseño.toFixed(2)} A</p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Sección por capacidad de corriente</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{resultado.seccionPorCorriente} mm²</p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Sección por caída de tensión</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{resultado.seccionPorCaida} mm²</p>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Sección recomendada</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{resultado.seccionRecomendada} mm²</p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Capacidad de corriente del conductor</h3>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{resultado.capacidadConductor} A</p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Caída de tensión real</h3>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{resultado.caidaReal}%</p>
                  {resultado.caidaReal <= parseFloat(caidaMaxima) ? (
                    <p className="text-green-600 dark:text-green-400 text-sm">✓ Cumple con la normativa</p>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 text-sm">✗ No cumple con la normativa</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-4 pt-6">
                <button onClick={guardarResultado} className="btn btn-secondary">
                  Guardar Resultado
                </button>
                <button onClick={generarReporte} className="btn btn-outline">
                  Añadir a Reporte
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Columna Derecha: Historial */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Historial de Cálculos</h2>
            {historial.length > 0 ? (
              <div className="space-y-4">
                {historial.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-semibold">Sección: {item.seccionRecomendada} mm²</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Corriente: {item.corrienteDiseño.toFixed(2)} A, ΔV: {item.caidaReal}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No hay resultados guardados.</p>
            )}
          </div>
          <div className="card">
             <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Proyecto</h2>
             <div className="flex space-x-4">
                <button onClick={generarReporte} className="btn btn-primary w-full">
                  Generar Reporte
                </button>
                <button onClick={guardarProyecto} className="btn btn-outline w-full">
                  Guardar
                </button>
              </div>
          </div>
           <div className="mt-6">
            <Link href="/calculadoras" className="text-blue-500 hover:text-blue-600 inline-flex items-center">
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
