'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import Link from 'next/link';

interface LabelData {
  fabricante: string;
  nombre: string;
  servicio: 'Normal' | 'Emergencia';
  tension: string;
  corriente: string;
  fases: string;
  empresa: string;
  ano: string;
  ip: string;
  ambiente: string;
  labelWidth: number;
}

const LabelRow = ({ title, value }: { title: string; value: string }) => (
  <div className="flex mb-2 text-sm items-center">
    <span className="font-bold basis-1/2 pr-2">
      {title}
    </span>
    <span className="basis-1/2 break-all">
      {value}
    </span>
  </div>
);

export default function ElectricalPanelLabelGenerator() {
  const [formData, setFormData] = useState<LabelData>({
    fabricante: '',
    nombre: '',
    servicio: 'Normal',
    tension: '',
    corriente: '',
    fases: '',
    empresa: '',
    ano: new Date().getFullYear().toString(),
    ip: '',
    ambiente: '',
    labelWidth: 120,
  });

  const [generatedLabel, setGeneratedLabel] = useState<React.ReactNode | null>(null);
  const labelOutputRef = useRef<HTMLDivElement>(null);
  const printStyleRef = useRef<HTMLStyleElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { ambiente, ...rest } = formData;

    const labelContent = (
      <>
        <LabelRow title="MARCA FABRICACIÓN:" value={rest.fabricante.toUpperCase()} />
        <LabelRow title="NOMBRE TABLERO:" value={rest.nombre.toUpperCase()} />
        <LabelRow title="TIPO SERVICIO:" value={rest.servicio.toUpperCase()} />
        <LabelRow title="TENSIÓN SERVICIO:" value={`${rest.tension}V`} />
        <LabelRow title="CORRIENTE NOMINAL:" value={`${rest.corriente}A`} />
        <LabelRow title="N° DE FASES:" value={rest.fases} />
        <LabelRow title="EMPRESA DESARROLLADORA:" value={rest.empresa.toUpperCase()} />
        <LabelRow title="AÑO INSTALACIÓN:" value={rest.ano} />
        <LabelRow title="GRADO PROTECCIÓN:" value={rest.ip.toUpperCase()} />
        {ambiente && <LabelRow title="TIPO DE AMBIENTE:" value={ambiente.toUpperCase()} />}
      </>
    );

    setGeneratedLabel(labelContent);

    if (!printStyleRef.current) {
      const style = document.createElement('style');
      style.id = 'print-style';
      document.head.appendChild(style);
      printStyleRef.current = style;
    }
    printStyleRef.current.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #label-output-print, #label-output-print * { visibility: visible; }
        #label-output-print { 
          position: absolute; 
          left: 0; top: 0; 
          border: 2px solid #000 !important;
          box-shadow: none;
          width: ${formData.labelWidth}mm !important;
        }
      }
    `;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (labelOutputRef.current) {
      html2canvas(labelOutputRef.current, {
        scale: 2,
        backgroundColor: '#ffffff', // Fondo blanco sólido que html2canvas entiende
        onclone: (clonedDoc) => {
          // Inyectamos estilos en el documento clonado para forzar colores simples
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            #label-output-print, #label-output-print * {
              color: #000000 !important;
              border-color: #000000 !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `rotulo-${formData.nombre || 'tablero'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(err => {
        console.error("Error al generar el canvas:", err);
        alert("Hubo un error al intentar descargar la imagen. Revisa la consola para más detalles.");
      });;
    }
  };

  const widthInPx = formData.labelWidth * 3.7795; // Approx conversion from mm to px

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Generador de Rótulos para Tableros</h1>
        <p className="text-gray-600 dark:text-gray-400">Crea rótulos para tableros eléctricos según la normativa RIC N°02.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Datos del Tablero</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fabricante" className="form-label">Marca de Fabricación:</label>
                <input id="fabricante" value={formData.fabricante} onChange={handleChange} className="form-input" required />
              </div>
              <div>
                <label htmlFor="nombre" className="form-label">Nombre del Tablero:</label>
                <input id="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: TGAux A. y F." className="form-input" required />
              </div>
              <div>
                <label htmlFor="servicio" className="form-label">Tipo de servicio:</label>
                <select id="servicio" value={formData.servicio} onChange={handleChange} className="form-select">
                  <option value="Normal">Normal</option>
                  <option value="Emergencia">Emergencia</option>
                </select>
              </div>
              <div>
                <label htmlFor="tension" className="form-label">Tensión de servicio (V):</label>
                <input id="tension" value={formData.tension} onChange={handleChange} className="form-input" placeholder='220/380' required />
              </div>
              <div>
                <label htmlFor="corriente" className="form-label">Corriente nominal (A):</label>
                <input id="corriente" type="number" value={formData.corriente} onChange={handleChange} className="form-input" placeholder='16' required />
              </div>
              <div>
                <label htmlFor="fases" className="form-label">Número de fases:</label>
                <input id="fases" type="number" value={formData.fases} onChange={handleChange} className="form-input" required />
              </div>
              <div>
                <label htmlFor="empresa" className="form-label">Empresa desarrolladora:</label>
                <input id="empresa" value={formData.empresa} onChange={handleChange} className="form-input" required />
              </div>
              <div>
                <label htmlFor="ano" className="form-label">Año de instalación:</label>
                <input id="ano" type="number" value={formData.ano} onChange={handleChange} className="form-input" placeholder='2025' required />
              </div>
              <div>
                <label htmlFor="ip" className="form-label">Grado de Protección IP:</label>
                <input id="ip" value={formData.ip} onChange={handleChange} className="form-input" placeholder='IP54' required />
              </div>
              <div>
                <label htmlFor="ambiente" className="form-label">Tipo de ambiente (si es especial):</label>
                <input id="ambiente" value={formData.ambiente} onChange={handleChange} placeholder="Ej: Ambiente Salino" className="form-input" />
              </div>
              <hr className="my-4 border-gray-200 dark:border-gray-700" />
              <div>
                <label htmlFor="labelWidth" className="form-label">Ancho de Impresión (mm):</label>
                <input id="labelWidth" type="number" value={formData.labelWidth} onChange={handleChange} className="form-input" required />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Generar Rótulo
              </button>
          </form>
        </div>

        <div className="container  px-4 ">
         <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Vista Previa del Rótulo
          </h2>
          <br />
          {generatedLabel && (
            <>
              <div className="space-y-4">
                <div
                  id="label-output-print"
                  ref={labelOutputRef}
                  className="border-2 border-gray-600 p-4 bg-white font-mono shadow-md text-black"
                  style={{ width: `${widthInPx}px` }}
                >
                  {generatedLabel}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handlePrint} className="btn btn-primary ">
                    Imprimir Rótulo
                  </button>
                  <button onClick={handleDownload} className="btn btn-primary ">
                    Descargar como Imagen
                  </button>
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
            </>
          )}
        </div>
        
        </div>
      </div>
    </div>
  );
}
