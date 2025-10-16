"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { empalmesData, type Empalme, type TipoInstalacion } from './data';

// --- Tipos ---
type HistoryItem = {
    id: number;
    inputs: {
        tipoInstalacion: TipoInstalacion;
        metodoCalculo: 'potencia' | 'corriente';
        valorBuscado: string;
    };
    resultado: Empalme;
};

// --- Lógica de la Aplicación ---
function seleccionarEmpalmePorPotencia(tipoInstalacion: TipoInstalacion, potenciaRequeridaKW: number): Empalme | null {
    const tabla = tipoInstalacion === 'monofasica' ? empalmesData.empalmes_monofasicos : empalmesData.empalmes_trifasicos;
    return tabla.find(emp => emp.pot_nominal_kw >= potenciaRequeridaKW) || null;
}

function seleccionarEmpalmePorCorriente(tipoInstalacion: TipoInstalacion, corrienteRequeridaA: number): Empalme | null {
    const tabla = tipoInstalacion === 'monofasica' ? empalmesData.empalmes_monofasicos : empalmesData.empalmes_trifasicos;
    return tabla.find(emp => emp.interruptor_termomagnetico_A >= corrienteRequeridaA) || null;
}

export default function EmpalmesPage() {
    // --- Estado del Componente ---
    const [tipoInstalacion, setTipoInstalacion] = useState<TipoInstalacion>('trifasica');
    const [metodoCalculo, setMetodoCalculo] = useState<'potencia' | 'corriente'>('potencia');
    const [potencia, setPotencia] = useState('');
    const [corriente, setCorriente] = useState('');
    const [resultado, setResultado] = useState<Empalme | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [valorBuscado, setValorBuscado] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setResultado(null);
        setValorBuscado(null);

        let empalme: Empalme | null = null;
        let valorInput: string = '';

        if (metodoCalculo === 'potencia') {
            const potenciaValue = potencia.replace(',', '.');
            const potenciaNum = parseFloat(potenciaValue);

            if (isNaN(potenciaNum) || potenciaNum <= 0) {
                setError('Por favor, ingresa un valor de potencia válido y mayor a cero.');
                return;
            }
            empalme = seleccionarEmpalmePorPotencia(tipoInstalacion, potenciaNum);
            valorInput = `${potenciaNum.toLocaleString('es-CL')} kW`;

        } else {
            const corrienteNum = parseFloat(corriente.replace(',', '.'));

            if (isNaN(corrienteNum) || corrienteNum <= 0) {
                setError('Por favor, ingresa un valor de corriente válido y mayor a cero.');
                return;
            }
            empalme = seleccionarEmpalmePorCorriente(tipoInstalacion, corrienteNum);
            valorInput = `${corrienteNum.toLocaleString('es-CL')} A`;
        }
        
        setValorBuscado(valorInput);

        if (empalme) {
            setResultado(empalme);
            // Guardar en el historial
            const newHistoryItem: HistoryItem = {
                id: Date.now(),
                inputs: {
                    tipoInstalacion,
                    metodoCalculo,
                    valorBuscado: valorInput,
                },
                resultado: empalme,
            };
            setHistory([newHistoryItem, ...history]);
        } else {
            const unidad = metodoCalculo === 'potencia' ? 'la potencia' : 'la corriente';
            setError(`No se encontró un empalme estandarizado para ${unidad} solicitada. Es posible que el valor sea demasiado alto para las opciones disponibles.`);
        }
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Calculadora de Empalme Eléctrico</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Encuentra el tipo de empalme normalizado según la potencia o corriente que necesites.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna de Formulario y Detalles */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Datos de Entrada</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* ... (controles del formulario sin cambios) ... */}
                            <div>
                                <label className="form-label">Calcular por</label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            name="metodo_calculo"
                                            value="potencia"
                                            checked={metodoCalculo === 'potencia'}
                                            onChange={() => setMetodoCalculo('potencia')}
                                        />
                                        <span className="ml-2">Potencia (kW)</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio"
                                            name="metodo_calculo"
                                            value="corriente"
                                            checked={metodoCalculo === 'corriente'}
                                            onChange={() => setMetodoCalculo('corriente')}
                                        />
                                        <span className="ml-2">Corriente (A)</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="tipoInstalacion" className="form-label">Tipo de Instalación</label>
                                <select
                                    id="tipoInstalacion"
                                    value={tipoInstalacion}
                                    onChange={(e) => setTipoInstalacion(e.target.value as TipoInstalacion)}
                                    className="form-select"
                                    required
                                >
                                    <option value="trifasica">Trifásica</option>
                                    <option value="monofasica">Monofásica</option>
                                </select>
                            </div>

                            {metodoCalculo === 'potencia' ? (
                                <div>
                                    <label htmlFor="potencia" className="form-label">Potencia Requerida (kW)</label>
                                    <input
                                        type="text"
                                        id="potencia"
                                        value={potencia}
                                        onChange={(e) => setPotencia(e.target.value)}
                                        placeholder="Ej: 20,5"
                                        className="form-input"
                                        required
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="corriente" className="form-label">Corriente de servicio (A)</label>
                                    <input
                                        type="text"
                                        id="corriente"
                                        value={corriente}
                                        onChange={(e) => setCorriente(e.target.value)}
                                        placeholder="Ej: 32"
                                        className="form-input"
                                        required
                                    />
                                </div>
                            )}

                            <div className="pt-2">
                                <button type="submit" className="btn btn-primary">Calcular Empalme</button>
                            </div>
                        </form>
                    </div>
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Notas Informativas</h2>
                        <ul className="space-y-3 text-sm list-disc list-inside text-gray-600 dark:text-gray-400">
                            <li>
                                <strong>Abreviaturas de Tipo de Empalme:</strong>
                                <ul className="pl-5 mt-1 space-y-1 list-disc list-inside">
                                    <li><strong>A:</strong> Aéreo</li>
                                    <li><strong>S:</strong> Subterráneo</li>
                                    <li><strong>AR:</strong> Aéreo con medidor reactivo</li>
                                    <li><strong>SR:</strong> Subterráneo con medidor reactivo</li>
                                </ul>
                            </li>
                            <li>Las instalaciones de consumo de viviendas deberán disponer de un empalme eléctrico cuya capacidad mínima de la protección será de 25 A.</li>
                        </ul>
                    </div>
                </div>

                {/* Columna de Resultados e Historial */}
                <div className="space-y-6">
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Resultados</h2>
                        {/* ... (lógica de resultados sin cambios) ... */}
                        {!resultado && !error && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">Complete el formulario para ver el empalme recomendado.</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md">
                                <h4 className="font-bold">Error</h4>
                                <p>{error}</p>
                                {valorBuscado && <p className="mt-2 text-sm">Valor solicitado: {valorBuscado}</p>}
                            </div>
                        )}

                        {resultado && (
                            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-md space-y-2">
                                <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">Empalme Recomendado</h4>
                                <p><strong>Tipo de Tarifa:</strong> {'tipo_tarifa' in resultado ? resultado.tipo_tarifa : 'No especificada'}</p>
                                <p><strong>Potencia a contratar:</strong> {resultado.pot_nominal_kw.toLocaleString('es-CL')} kW</p>
                                <p><strong>Interruptor termomagnético:</strong> {resultado.interruptor_termomagnetico_A} A</p>
                                <p><strong>Potencia máxima de empalme:</strong> {resultado.pot_max_empalme_kva.toLocaleString('es-CL')} kVA</p>
                                <p><strong>Tipo de empalme normalizado:</strong> {resultado.tipo_empalme}</p>
                            </div>
                        )}
                    </div>

                    {/* Historial */}
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
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay selecciones guardadas.</p>
                            ) : (
                                history.map((item) => (
                                    <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                                        <p className="font-semibold text-md text-blue-600 dark:text-blue-400">{item.resultado.tipo_empalme}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Buscado: {item.inputs.valorBuscado} ({item.inputs.tipoInstalacion})
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            Pot: {item.resultado.pot_nominal_kw} kW, Int: {item.resultado.interruptor_termomagnetico_A} A
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