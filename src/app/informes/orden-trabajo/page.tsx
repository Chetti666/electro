'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { FileDown, Info } from 'lucide-react';

type Emision = 'original' | 'copia';

function Line({ className = '', width }: { className?: string; width?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`ot-line ${className}`}
      style={width ? { width, flex: '0 0 auto' } : undefined}
    />
  );
}

function Check({ children }: { children: ReactNode }) {
  return (
    <span className="ot-check-row">
      <span aria-hidden="true" className="ot-check" />
      {children}
    </span>
  );
}

function OrderPage({ folio, emision }: { folio: string; emision: Emision }) {
  return (
    <article
      className="ot-page text-[10px] leading-tight text-slate-900 select-none"
      data-folio={folio}
      aria-label={`Vista previa de orden de trabajo, folio ${folio}`}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* HEADER: título, emisión y folio */}
        <header className="border-b-2 border-slate-900 pb-1.5 mb-2 flex justify-between items-end">
          <div className="flex items-center gap-2">
            <h1 className="font-black text-base tracking-tight uppercase text-slate-950">
              ORDEN DE TRABAJO
            </h1>
            <span
              className={`ot-badge ${
                emision === 'copia' ? 'ot-badge-copy' : ''
              }`}
            >
              {emision === 'copia' ? 'COPIA' : 'ORIGINAL'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[8.5px] font-bold text-slate-600 uppercase tracking-wider block">
              FOLIO OT
            </span>
            <span
              className="ot-mono font-extrabold text-base text-red-600 text-right border-b border-red-300 inline-block"
              style={{ width: '6rem' }}
            >
              {folio}
            </span>
          </div>
        </header>

        {/* FECHA Y PRIORIDAD */}
        <section className="grid grid-cols-12 gap-2 mb-2 bg-slate-100 p-1.5 rounded border border-slate-300 text-[9.5px]">
          <div className="col-span-5 flex items-center gap-1.5">
            <span className="font-bold text-slate-800">FECHA:</span>
            <Line />
          </div>
          <div className="col-span-7 flex items-center justify-end gap-4">
            <span className="font-bold text-slate-800">PRIORIDAD:</span>
            <Check>Normal</Check>
            <Check>Urgente</Check>
          </div>
        </section>

        {/* 1. CLIENTE / OBRA Y MOTIVO */}
        <section className="ot-card">
          <div className="ot-card-header">
            1. DATOS DEL CLIENTE / OBRA Y MOTIVO DE VISITA
          </div>

          <div className="p-1.5 grid grid-cols-12 gap-x-3 text-[9.5px]">
            <div className="col-span-7 grid grid-cols-12 gap-x-2 gap-y-1 pr-3 border-r border-slate-300">
              <div className="col-span-12 flex items-center">
                <span className="font-bold text-slate-700 w-24 shrink-0">
                  Nombre / R. Social:
                </span>
                <Line />
              </div>
              <div className="col-span-7 flex items-center">
                <span className="font-bold text-slate-700 w-14 shrink-0">
                  Dirección:
                </span>
                <Line />
              </div>
              <div className="col-span-5 flex items-center">
                <span className="font-bold text-slate-700 w-14 shrink-0">
                  Comuna:
                </span>
                <Line />
              </div>
              <div className="col-span-7 flex items-center">
                <span className="font-bold text-slate-700 w-14 shrink-0">
                  Contacto:
                </span>
                <Line />
              </div>
              <div className="col-span-5 flex items-center">
                <span className="font-bold text-slate-700 w-14 shrink-0">
                  Teléfono:
                </span>
                <Line className="ot-mono" />
              </div>
              <div className="col-span-12 flex items-center">
                <span className="font-bold text-slate-700 w-14 shrink-0">
                  Email:
                </span>
                <Line />
              </div>
            </div>

            <div className="col-span-5 text-[9px] font-medium">
              <div className="font-bold text-slate-700 mb-1">
                Motivo de Visita:
              </div>
              <div className="grid grid-cols-2 gap-y-1 gap-x-1.5">
                <Check>INSTALACIÓN NUEVA</Check>
                <Check>REPARACIÓN</Check>
                <Check>MANTENIMIENTO</Check>
                <Check>LEVANTAMIENTO / TE1</Check>
                <Check>INSPECCIÓN</Check>
                <Check>AUMENTO CAPACIDAD</Check>
                <div className="col-span-2 flex items-center gap-1.5">
                  <Check>OTRO:</Check>
                  <Line />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CHECKLIST INSTALACIÓN EXISTENTE */}
        <section className="ot-card">
          <div className="ot-card-header">
            2. CHECKLIST INSTALACIÓN EXISTENTE
          </div>

          <div className="divide-y divide-slate-300 text-[9px]">
            <div className="grid grid-cols-12 divide-x divide-slate-300 p-1 bg-white items-center">
              <div className="col-span-5 flex items-center gap-1 pr-2">
                <span className="font-bold text-slate-800 whitespace-nowrap">
                  Tipo Instalación:
                </span>
                
              </div>
              <div className="col-span-4 flex items-center justify-start gap-3 px-1">
                <span className="font-bold text-slate-800">Empalme:</span>
                <Check>Monofásico</Check>
                <Check>Trifásico</Check>
              </div>
              <div className="col-span-3 flex items-center gap-1 pl-1 pr-2">
                <span className="font-bold text-slate-800 whitespace-nowrap">
                  Capacidad nom.:
                </span>
                
              </div>
            </div>

            <div className="p-1 bg-slate-50/70 flex items-center gap-2">
              <span className="font-bold text-slate-800 whitespace-nowrap">
                Estado suministro:
              </span>
              <div className="flex-1 min-w-0 flex items-center justify-start gap-5">
                <Check>Energizada</Check>
                <Check>Desenergizada</Check>
                <Check>Con cortocircuito / falla</Check>
                <div className="flex items-center gap-1">
                  <Check>Otro:</Check>
                  
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 divide-x divide-slate-300 p-1 bg-white items-center">
              <div className="col-span-4 flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  Instalación Certificada:
                </span>
                <Check>Sí</Check>
                <Check>No</Check>
              </div>
              <div className="col-span-4 flex items-center gap-1 pl-1 justify-center">
                <span className="font-bold text-slate-800 whitespace-nowrap">
                  Antigüedad instalación:
                </span>
                <Line width="2rem" />
                <span className="font-bold">Años</span>
              </div>
              <div className="col-span-4 flex items-center gap-2 pl-1 justify-start">
                <span className="font-bold text-slate-800">
                  Instalación bajo norma:
                </span>
                <Check>Sí</Check>
                <Check>No</Check>
              </div>
            </div>

            <div className="p-1 bg-white flex items-start gap-1">
              <span className="font-bold text-slate-800 w-20">Observación:</span>
              
            </div>

            <div className="p-1 bg-slate-50/70 flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800">
                Procedimiento Autorizado:
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                <Check>Solo revisión</Check>
                <Check>Presupuesto</Check>
                <Check>Aislamiento falla</Check>
                <Check>Reparación</Check>
                <div className="flex items-center gap-1">
                  <Check>Otro:</Check>
                  
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. OBSERVACIONES */}
        <section className="ot-card flex-1 flex flex-col min-h-0">
          <div className="ot-card-header">
            3. OBSERVACIONES Y/O DESCRIPCIÓN DE LOS TRABAJOS REALIZADOS
          </div>
          <div className="p-1.5 bg-white flex-1 min-h-0">
            <div className="ot-ruled" />
          </div>
        </section>

        {/* 4. CONTROL FINANCIERO */}
        <section className="ot-card">
          <div className="ot-card-header flex justify-between items-center">
            <span>4. CONTROL FINANCIERO DE LA ORDEN</span>
            <span className="text-[7.5px] font-normal text-slate-600"> </span>
          </div>
          <div className="p-1.5 grid grid-cols-4 gap-2 text-center text-[9px]">
            <div className="bg-white p-1 rounded border border-slate-300">
              <span className="block text-[7.5px] font-bold text-slate-500 uppercase">
                PRESUPUESTO TOTAL
              </span>
              <div className="flex items-center justify-start font-bold text-slate-900 mt-0.5">
                <span>$</span>
                
              </div>
            </div>

            <div className="bg-white p-1 rounded border border-slate-300">
              <span className="block text-[7.5px] font-bold text-slate-500 uppercase">
                ABONO / ANTICIPO
              </span>
              <div className="flex items-center justify-start font-bold text-emerald-700 mt-0.5">
                <span>$</span>
                
              </div>
            </div>

            <div className="bg-white p-1 rounded border border-slate-300">
              <span className="block text-[7.5px] font-bold text-slate-500 uppercase">
                COTIZACIÓN / REF.
              </span>
              <div className="flex items-center justify-center font-bold text-slate-800 mt-0.5">
                
              </div>
            </div>

            <div className="bg-amber-100 p-1 rounded border border-amber-400">
              <span className="block text-[7.5px] font-bold text-amber-900 uppercase">
                SALDO PENDIENTE
              </span>
              <div className="flex items-center justify-start font-extrabold text-amber-950 mt-0.5">
                <span>$</span>
                
              </div>
            </div>
          </div>
        </section>

        {/* 5. CONDICIONES */}
        <section className="ot-card ot-card-soft p-1.5 text-[8px]">
          <div className="font-bold text-slate-900 uppercase text-[8.5px] mb-1">
            5. CONDICIONES Y CLÁUSULAS DEL SERVICIO
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-700 font-medium leading-tight">
            <li>
              Autorizo la revisión y/o reparación detallada en esta Orden de
              Trabajo.
            </li>
            <li>
              El instalador no se hace responsable por fallas eléctricas
              preexistentes en circuitos no intervenidos durante este servicio.
            </li>
            <li>
              Si la instalación no cumple con la normativa SEC vigente, el
              funcionamiento de los equipos instalados queda bajo la
              responsabilidad del cliente.
            </li>
            <li>
              Todo diagnóstico tiene un costo base que se sumará o descontará de
              la reparación final según presupuesto.
            </li>
          </ul>
        </section>
      </div>

      {/* 6. FIRMAS */}
      <footer className="flex flex-col gap-1.5">
        <div className="ot-card ot-card-flush ot-card-muted p-2">
          <div className="font-bold text-slate-900 uppercase text-[8.5px] border-b border-slate-300 pb-0.5 mb-2 text-left">
            6. FIRMAS Y CONFORMIDAD DE RECEPCIÓN
          </div>
          <div className="grid grid-cols-2 gap-6 text-[8.5px]">
            <div className="text-left flex flex-col justify-between h-20 border-r border-slate-300 pr-4">
              <div className="border-b border-dashed border-slate-400 pb-1 mb-1 flex-1 flex items-end justify-center">
                <span className="text-slate-400 italic font-serif text-[9.5px]">
                  Firma / Timbre Instalador SEC
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-700 w-16">
                    INSTALADOR:
                  </span>
                  <Line />
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-bold text-slate-700 w-16">
                    RUT / SEC:
                  </span>
                  <Line className="ot-mono" />
                </div>
              </div>
            </div>

            <div className="text-left flex flex-col justify-between h-20 pl-2">
              <p className="text-[7.5px] text-slate-600 italic leading-tight">
                Declaro recibir a entera conformidad los trabajos eléctricos
                detallados en este documento.
              </p>
              <div className="border-b border-dashed border-slate-400 pb-1 mb-1 flex-1 flex items-end justify-center">
                <span className="text-slate-400 italic font-serif text-[9.5px]">
                  Firma / V°B° Cliente
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-700 w-14">NOMBRE:</span>
                  <Line />
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-bold text-slate-700 w-14">RUT:</span>
                  <Line className="ot-mono" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </article>
  );
}

export default function OrdenTrabajoPage() {
  const [folioInput, setFolioInput] = useState('1');
  const [qtyInput, setQtyInput] = useState('1');
  const [emision, setEmision] = useState<Emision>('original');

  useEffect(() => {
    document.body.classList.add('ot-print-ready');
    return () => document.body.classList.remove('ot-print-ready');
  }, []);

  const rawFolio = folioInput.replace(/\D/g, '');
  const parsedFolio = Number.parseInt(rawFolio, 10);
  const startFolio = Number.isFinite(parsedFolio) ? parsedFolio : 0;
  const digits = Math.max(5, rawFolio.length);

  const qty = Math.max(1, Math.min(100, Number.parseInt(qtyInput, 10) || 1));

  const folios = useMemo(
    () =>
      Array.from({ length: qty }, (_, index) =>
        String(startFolio + index).padStart(digits, '0')
      ),
    [qty, startFolio, digits]
  );

  const rangeLabel =
    folios.length === 1
      ? `Folio ${folios[0]}`
      : `Folios ${folios[0]} al ${folios[folios.length - 1]}`;

  const handleDownload = () => {
    const previousTitle = document.title;
    const printedTitle =
      folios.length === 1
        ? `Orden de Trabajo ${folios[0]}`
        : `Ordenes de Trabajo ${folios[0]} al ${folios[folios.length - 1]}`;

    document.title = printedTitle;

    let restored = false;
    const restoreTitle = () => {
      if (restored) return;
      restored = true;
      document.title = previousTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };

    window.addEventListener('afterprint', restoreTitle);
    window.print();
    window.setTimeout(restoreTitle, 1500);
  };

  return (
    <div className="ot-tool">
      <div className="ot-toolbar no-print">
        <div className="ot-toolbar-inner">
          <div className="ot-brand">
            <div>
              <h1>Generador de Órdenes de Trabajo</h1>
              <p>
                Formato A4 imprimible · Talonario con folio consecutivo
              </p>
            </div>
          </div>

          <div className="ot-controls">
            <label className="ot-field">
              <span>Folio inicial</span>
              <input
                type="number"
                min={0}
                step={1}
                value={folioInput}
                onChange={(event) => setFolioInput(event.target.value)}
                onBlur={() => {
                  if (rawFolio === '') setFolioInput('0');
                }}
              />
            </label>

            <label className="ot-field">
              <span>Cantidad</span>
              <input
                type="number"
                min={1}
                max={100}
                step={1}
                value={qtyInput}
                onChange={(event) => setQtyInput(event.target.value)}
                onBlur={() => setQtyInput(String(qty))}
              />
            </label>

            <label className="ot-field">
              <span>Emisión</span>
              <select
                value={emision}
                onChange={(event) =>
                  setEmision(event.target.value as Emision)
                }
              >
                <option value="original">Original</option>
                <option value="copia">Copia</option>
              </select>
            </label>

            <button
              type="button"
              className="ot-download"
              onClick={handleDownload}
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              Descargar PDF
            </button>
          </div>
        </div>

        <div className="ot-toolbar-foot">
          <span>
            <strong>{qty}</strong> {qty === 1 ? 'documento' : 'documentos'} ·{' '}
            {rangeLabel}
          </span>
          <span className="ot-note">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            Se abrirá el diálogo de impresión: elige «Guardar como PDF».
          </span>
        </div>
      </div>

      <div className="ot-preview">
        {folios.map((folio, index) => (
          <OrderPage
            key={`${folio}-${index}`}
            folio={folio}
            emision={emision}
          />
        ))}
      </div>
    </div>
  );
}
