'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CalculationResult {
  corrienteDiseño: number;
  resistenciaConductor: number;
  caidaAbsoluta: number;
  caidaPorcentual: number;
  cumpleNormativa: boolean;
  id: number;
}

export default function CaidaTension() {
  // Estados para los campos del formulario
  const [tipoCircuito, setTipoCircuito] = useState('monofasico');
  const [usarPotencia, setUsarPotencia] = useState(true);
  const [potencia, setPotencia] = useState('');
  const [corriente, setCorriente] = useState('');
  const [tension, setTension] = useState('');
  const [factorPotencia, setFactorPotencia] = useState('0.95');
  const [longitud, setLongitud] = useState('');
  const [seccion, setSeccion] = useState('');
  const [material, setMaterial] = useState('cobre');
  const [temperatura, setTemperatura] = useState('70');
  const [caidaMaxima, setCaidaMaxima] = useState('3');
  
  // Estado para el resultado actual
  const [resultado, setResultado] = useState<CalculationResult | null>(null);
  
  // Estado para el historial de resultados
  const [historial, setHistorial] = useState<CalculationResult[]>([]);

  // Sincronizar campos de potencia y corriente
  useEffect(() => {
    if (usarPotencia && potencia && tension && factorPotencia) {
      const potenciaNum = parseFloat(potencia);
      const tensionNum = parseFloat(tension);
      const factorPotenciaNum = parseFloat(factorPotencia);
      
      let corrienteCalculada = 0;
      if (tipoCircuito === 'monofasico') {
        corrienteCalculada = potenciaNum / (tensionNum * factorPotenciaNum);
      } else if (tipoCircuito === 'trifasico') {
        corrienteCalculada = potenciaNum / (Math.sqrt(3) * tensionNum * factorPotenciaNum);
      } else { // DC
        corrienteCalculada = potenciaNum / tensionNum;
      }
      
      setCorriente(corrienteCalculada.toFixed(2));
    } else if (!usarPotencia && corriente && tension && factorPotencia) {
      const corrienteNum = parseFloat(corriente);
      const tensionNum = parseFloat(tension);
      const factorPotenciaNum = parseFloat(factorPotencia);
      
      let potenciaCalculada = 0;
      if (tipoCircuito === 'monofasico') {
        potenciaCalculada = corrienteNum * tensionNum * factorPotenciaNum;
      } else if (tipoCircuito === 'trifasico') {
        potenciaCalculada = corrienteNum * Math.sqrt(3) * tensionNum * factorPotenciaNum;
      } else { // DC
        potenciaCalculada = corrienteNum * tensionNum;
      }
      
      setPotencia(potenciaCalculada.toFixed(2));
    }
  }, [usarPotencia, tipoCircuito, potencia, corriente, tension, factorPotencia]);
  
  // Función para calcular
  const calcular = (e: React.FormEvent) => {
    e.preventDefault();
    
    const corrienteNum = parseFloat(corriente);
    const longitudNum = parseFloat(longitud);
    const seccionNum = parseFloat(seccion);
    const tensionNum = parseFloat(tension);
    const caidaMaximaNum = parseFloat(caidaMaxima);
    
    const resistencia = 0.0175 * longitudNum / seccionNum; // Ejemplo simplificado
    
    let caida = 0;
    if (tipoCircuito === 'monofasico') {
      caida = (2 * corrienteNum * 0.0175 * longitudNum) / seccionNum;
    } else if (tipoCircuito === 'trifasico') {
      caida = Math.sqrt(3) * corrienteNum * 0.0175 * longitudNum / seccionNum;
    } else { // DC
      caida = 2 * corrienteNum * 0.0175 * longitudNum / seccionNum;
    }
    
    const caidaPorcentaje = (caida / tensionNum) * 100;

    const nuevoResultado: CalculationResult = {
      corrienteDiseño: corrienteNum,
      resistenciaConductor: resistencia,
      caidaAbsoluta: caida,
      caidaPorcentual: caidaPorcentaje,
      cumpleNormativa: caidaPorcentaje <= caidaMaximaNum,
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cálculo de Caída de Tensión</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Calcula la caída de tensión en circuitos eléctricos según distancia y carga.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal: Formulario y Resultados */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Datos de entrada</h2>
            <form onSubmit={calcular} className="space-y-4">
              {/* ... (campos del formulario sin cambios) ... */}
              {/* Tipo de circuito */}
              <div>
                <label className="form-label">Tipo de circuito</label>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="tipoCircuito"
                      value="monofasico"
                      checked={tipoCircuito === 'monofasico'}
                      onChange={(e) => setTipoCircuito(e.target.value)}
                    />
                    <span className="ml-2">Monofásico</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="tipoCircuito"
                      value="trifasico"
                      checked={tipoCircuito === 'trifasico'}
                      onChange={(e) => setTipoCircuito(e.target.value)}
                    />
                    <span className="ml-2">Trifásico</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="tipoCircuito"
                      value="dc"
                      checked={tipoCircuito === 'dc'}
                      onChange={(e) => setTipoCircuito(e.target.value)}
                    />
                    <span className="ml-2">DC</span>
                  </label>
                </div>
              </div>
              
              {/* Selección de entrada: Potencia o Corriente */}
              <div>
                <label className="form-label">Datos de entrada</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="tipoEntrada"
                      checked={usarPotencia}
                      onChange={() => setUsarPotencia(true)}
                    />
                    <span className="ml-2">Potencia</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="tipoEntrada"
                      checked={!usarPotencia}
                      onChange={() => setUsarPotencia(false)}
                    />
                    <span className="ml-2">Corriente</span>
                  </label>
                </div>
              </div>
              
              {/* Potencia */}
              <div className={!usarPotencia ? 'opacity-50' : ''}>
                <label htmlFor="potencia" className="form-label">
                  Potencia {tipoCircuito !== 'dc' ? '(W)' : '(W)'}
                </label>
                <input
                  type="number"
                  id="potencia"
                  className="form-input"
                  value={potencia}
                  onChange={(e) => setPotencia(e.target.value)}
                  placeholder="Ej: 5000"
                  disabled={!usarPotencia}
                  required={usarPotencia}
                />
              </div>
              
              {/* Corriente */}
              <div className={usarPotencia ? 'opacity-50' : ''}>
                <label htmlFor="corriente" className="form-label">Corriente (A)</label>
                <input
                  type="number"
                  id="corriente"
                  className="form-input"
                  value={corriente}
                  onChange={(e) => setCorriente(e.target.value)}
                  placeholder="Ej: 16"
                  disabled={usarPotencia}
                  required={!usarPotencia}
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
                  placeholder={tipoCircuito === 'monofasico' ? 'Ej: 230' : tipoCircuito === 'trifasico' ? 'Ej: 400' : 'Ej: 12'}
                  required
                />
              </div>
              
              {/* Factor de potencia (solo para AC) */}
              {tipoCircuito !== 'dc' && (
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
              )}
              
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
              
              {/* Sección */}
              <div>
                <label htmlFor="seccion" className="form-label">Sección del conductor (mm²)</label>
                <input
                  type="number"
                  id="seccion"
                  className="form-input"
                  value={seccion}
                  onChange={(e) => setSeccion(e.target.value)}
                  placeholder="Ej: 2.5"
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
              
              {/* Temperatura de operación */}
              <div>
                <label htmlFor="temperatura" className="form-label">Temperatura de operación (°C)</label>
                <input
                  type="number"
                  id="temperatura"
                  className="form-input"
                  value={temperatura}
                  onChange={(e) => setTemperatura(e.target.value)}
                  required
                />
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
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resultado.corrienteDiseño.toFixed(2)} A</p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Resistencia del conductor</h3>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{resultado.resistenciaConductor.toFixed(4)} Ω</p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Caída de tensión absoluta</h3>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{resultado.caidaAbsoluta.toFixed(2)} V</p>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Caída de tensión porcentual</h3>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resultado.caidaPorcentual.toFixed(2)}%</p>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Verificación normativa</h3>
                  {resultado.cumpleNormativa ? (
                    <p className="text-green-600 dark:text-green-400 text-sm">✓ Cumple con la normativa ({caidaMaxima}%)</p>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 text-sm">✗ No cumple con la normativa ({caidaMaxima}%)</p>
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
                    <p className="font-semibold">ΔV: {item.caidaPorcentual.toFixed(2)}%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Corriente: {item.corrienteDiseño.toFixed(2)} A</p>
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
