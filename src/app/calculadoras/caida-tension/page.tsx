'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
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
  ChartData,
  ChartOptions,
} from 'chart.js';
import annotationPlugin, { AnnotationOptions } from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';

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

// Definición del tipo para el historial
type HistoryItem = {
  id: number;
  tipoSistema: string;
  seccion: string;
  longitudMaxima: string;
  corriente: string;
  resultadoValor: string;
};

export default function CalculoVpPage() {
  // Estados para los campos del formulario
  const [tipoSistema, setTipoSistema] = useState('monofasico');
  const [seccion, setSeccion] = useState('');
  const [longitudMaxima, setLongitudMaxima] = useState('');
  const [corriente, setCorriente] = useState('');
  
  // Estados para los resultados y el historial
  const [resultadoValor, setResultadoValor] = useState<string | null>(null);
  const [longitudFinal, setLongitudFinal] = useState<string | null>(null);
  const [advertenciaCruce, setAdvertenciaCruce] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData<"line"> | null>(null);
  const [chartOptions, setChartOptions] = useState<ChartOptions<"line">>();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Función para calcular y graficar
  const calcularYGraficarVp = (e: FormEvent) => {
    e.preventDefault();

    const S = parseFloat(seccion);
    const L_max = parseFloat(longitudMaxima);
    const I = parseFloat(corriente);

    if (isNaN(S) || isNaN(L_max) || isNaN(I) || S <= 0 || L_max <= 0) {
      alert("Por favor, ingrese valores válidos y mayores que cero.");
      return;
    }

    const tensionNominal = (tipoSistema === 'monofasico') ? 220 : 380;
    const limiteVp = tensionNominal * 0.03;
    const constanteK = (tipoSistema === 'monofasico') ? 2 * 0.018 : Math.sqrt(3) * 0.018;

    const vp_final = (constanteK * L_max * I) / S;
    const resultadoFinalStr = `${vp_final.toFixed(2)} Volts`;

    setLongitudFinal(L_max.toString());
    setResultadoValor(resultadoFinalStr);

    // Guardar en el historial
    const newHistoryItem: HistoryItem = {
      id: Date.now(),
      tipoSistema,
      seccion,
      longitudMaxima,
      corriente,
      resultadoValor: resultadoFinalStr,
    };
    setHistory([newHistoryItem, ...history]);

    let longitudCruce: number | null = null;
    if (vp_final > limiteVp) {
      longitudCruce = (limiteVp * S) / (constanteK * I);
      setAdvertenciaCruce(`La sección no cumple. El límite del 3% se alcanza a los <span>${longitudCruce.toFixed(2)} metros</span>.`);
    } else {
      setAdvertenciaCruce(null);
    }

    // ... (resto de la lógica de la gráfica sin cambios) ...
    const dataPoints: {x: number, y: number}[] = [];
    const numeroDePuntos = Math.min(L_max, 100);
    for (let i = 0; i <= numeroDePuntos; i++) {
      const l_actual = (L_max / numeroDePuntos) * i;
      dataPoints.push({
        x: l_actual,
        y: (constanteK * l_actual * I) / S
      });
    }

    if (longitudCruce !== null) {
      dataPoints.push({ x: longitudCruce, y: limiteVp });
      dataPoints.sort((a, b) => a.x - b.x);
    }

    const etiquetas = dataPoints.map(p => p.x.toFixed(2));
    const datosVp = dataPoints.map(p => p.y);

    setChartData({
      labels: etiquetas,
      datasets: [{
        label: 'Caída de Tensión (Vp)',
        data: datosVp,
        borderColor: 'rgba(40, 167, 69, 1)',
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        fill: true,
        tension: 0.1
      }]
    });

    const annotations: { [key: string]: AnnotationOptions; } = {
      limiteHorizontal: {
        type: 'line',
        yMin: limiteVp,
        yMax: limiteVp,
        borderColor: 'red',
        borderWidth: 2,
        borderDash: [10, 5],
        label: {
          content: `Límite 3% (${limiteVp.toFixed(2)} V)`,
          display: true,
          position: 'end',
          backgroundColor: 'rgba(255, 99, 132, 0.8)'
        }
      },
      puntoInicial: {
        type: 'point',
        xValue: etiquetas[0],
        yValue: datosVp[0],
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        radius: 5,
      },
      labelInicial: {
        type: 'label',
        xValue: etiquetas[0],
        yValue: datosVp[0],
        content: ['0 m', `${datosVp[0].toFixed(2)} V`],
        font: { size: 10 },
        xAdjust: -20,
        yAdjust: -20,
      },
      puntoFinal: {
        type: 'point',
        xValue: etiquetas[etiquetas.length - 1],
        yValue: datosVp[datosVp.length - 1],
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        radius: 5,
      },
      labelFinal: {
        type: 'label',
        xValue: etiquetas[etiquetas.length - 1],
        yValue: datosVp[datosVp.length - 1],
        content: [`${L_max.toFixed(2)} m`, `${vp_final.toFixed(2)} V`],
        font: { size: 10 },
        xAdjust: 20,
        yAdjust: 20,
      }
    };

    if (longitudCruce !== null) {
      const cruceX = longitudCruce;
      annotations.limiteVertical = {
        type: 'line',
        xMin: cruceX,
        xMax: cruceX,
        borderColor: 'orange',
        borderWidth: 2,
        borderDash: [5, 5],
      };
      annotations.puntoCruce = {
        type: 'point',
        xValue: cruceX,
        yValue: limiteVp,
        backgroundColor: 'red',
        borderColor: 'darkred',
        borderWidth: 2,
        radius: 6,
      };
      annotations.labelCruce = {
        type: 'label',
        xValue: cruceX,
        yValue: limiteVp,
        content: `${cruceX.toFixed(2)} m`,
        font: { size: 10 },
        backgroundColor: 'rgba(255, 165, 0, 0.8)',
        yAdjust: -20
      };
    }

    setChartOptions({
      responsive: true,
      plugins: {
        title: { display: true, text: 'Evolución de la Caída de Tensión vs. Longitud' },
        annotation: { annotations: annotations }
      },
      scales: {
        x: { title: { display: true, text: 'Longitud (Metros)' } },
        y: { title: { display: true, text: 'Caída de Tensión (Volts)' }, beginAtZero: true }
      }
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Calculadora de Caída de Tensión (Vp)</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualiza la caída de tensión a lo largo de un conductor y su límite normativo.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Columna Izquierda: Formulario e Historial */}
        <div className="md:col-span-2 space-y-8">
          {/* Formulario */}
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Datos de entrada</h2>
            <form onSubmit={calcularYGraficarVp} className="space-y-4">
              <div>
                <label htmlFor="tipoCalculo" className="form-label">Tipo de Sistema:</label>
                <select id="tipoCalculo" value={tipoSistema} onChange={(e) => setTipoSistema(e.target.value)} className="form-select">
                  <option value="monofasico">Monofásico (220V)</option>
                  <option value="trifasico">Trifásico (380V)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="S" className="form-label">Sección del Conductor (S):</label>
                <input type="number" id="S" value={seccion} onChange={(e) => setSeccion(e.target.value)} placeholder="mm²" className="form-input" />
              </div>
              
              <div>
                <label htmlFor="L" className="form-label">Longitud Máxima (L):</label>
                <input type="number" id="L" value={longitudMaxima} onChange={(e) => setLongitudMaxima(e.target.value)} placeholder="Metros" className="form-input" />
              </div>
              
              <div>
                <label htmlFor="I" className="form-label">Corriente (I):</label>
                <input type="number" id="I" value={corriente} onChange={(e) => setCorriente(e.target.value)} placeholder="Amperes" className="form-input" />
              </div>
              
              <div className="pt-4">
                <button type="submit" className="btn btn-primary w-full sm:w-auto">
                  Calcular y Graficar
                </button>
              </div>
            </form>
          </div>

          {/* Historial de Cálculos */}
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
                    <p className="font-semibold text-base sm:text-lg text-blue-600 dark:text-blue-400">{item.resultadoValor}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      S: {item.seccion}mm², L: {item.longitudMaxima}m, I: {item.corriente}A ({item.tipoSistema})
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Columna Derecha: Resultados y Gráfico */}
        <div className="md:col-span-3">
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Resultados</h2>
            
            {resultadoValor && (
              <div className="results text-center mb-4">
                <p className="text-base sm:text-lg">Caída de Tensión (Vp) a <span className="font-bold text-emerald-500">{longitudFinal}</span> metros: <span className="font-bold text-emerald-500">{resultadoValor}</span></p>
              </div>
            )}
            {advertenciaCruce && (
              <div className="warning-message text-center mb-4 text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: advertenciaCruce }} />
            )}
            
            <div className="mt-4">
              {chartData ? <Line data={chartData} options={chartOptions} /> : <div className="text-center text-gray-500 py-8">Ingrese los datos para generar el gráfico.</div>}
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
