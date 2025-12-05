'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Loader2 } from 'lucide-react';

type SampleDocument = {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
};

// Estos datos se pueden mover a un archivo central si se usan en otros lugares
const sampleDocuments: SampleDocument[] = [

  {
    id: 'sample-resistividad',
    title: 'Informe de Resistividad',
    description: 'Ejemplo de un informe de resistividad con curva SEV y análisis de datos.',
    pdfUrl: '/samples/informe-resistividad-ejemplo.pdf',
  },

  {
    id: 'sample-informe-inspeccion',
    title: 'Informe de Inspección',
    description: 'Ejemplo de un informe de inspección generado por nuestra plataforma.',
    pdfUrl: '/samples/Informe-Inspeccion-ejemplo.pdf',
  },

   {
    id: 'sample-presupuesto',
    title: 'Presupuesto',
    description: 'Ejemplo de un presupuesto generado por nuestra plataforma.',
    pdfUrl: '/samples/Presupuesto-ejemplo.pdf',
  },
 
];
 
// Hook personalizado para medir el ancho de un elemento
function useContainerWidth() {
  const [containerWidth, setContainerWidth] = useState<number | undefined>();
  const observerRef = useRef<ResizeObserver | null>(null);
 
  // Usamos un "callback ref" para obtener el nodo del DOM.
  // Esta función se ejecuta cuando el elemento se monta o desmonta.
  const containerRef = (node: HTMLDivElement | null) => {
    // Desconectar el observer anterior si existe
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Si el nodo existe, creamos y conectamos un nuevo ResizeObserver
    if (node) {
      const observer = new ResizeObserver(() => {
        setContainerWidth(node.offsetWidth);
      });
      observer.observe(node);
      observerRef.current = observer; // Guardamos la instancia del observer
      setContainerWidth(node.offsetWidth); // Establecemos el ancho inicial
    }
  };
 
  return { containerRef, containerWidth };
}

// Componente que encapsula la lógica de react-pdf.
// Será importado dinámicamente para evitar problemas de SSR en el build de Vercel.
const PDFDisplay = ({
  pdfUrl,
  containerWidth,
  onLoadSuccess,
  onPageRenderError,
  numPages,
}: {
  pdfUrl: string;
  containerWidth: number | undefined;
  onLoadSuccess: (pdf: { numPages: number }) => void;
  onPageRenderError: (error: Error) => void;
  numPages: number | null;
}) => {
  // Importamos Document y Page aquí dentro, ya que este componente solo se renderiza en el cliente.
  const { Document, Page } = require('react-pdf');

  return (
    <Document file={pdfUrl} onLoadSuccess={onLoadSuccess} loading={<div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 text-blue-500 animate-spin" /></div>} error={<div className="flex items-center justify-center h-full text-red-500">Error al cargar el PDF. Asegúrate que el archivo existe en <code>public/samples/</code>.</div>}>
      {Array.from(new Array(numPages), (el, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} width={containerWidth ? containerWidth - 48 : undefined} className="mb-4 shadow-md" onRenderError={onPageRenderError} />
      ))}
    </Document>
  );
};

// Hacemos la importación dinámica del componente que usa react-pdf
const DynamicPDFDisplay = dynamic(() => Promise.resolve(PDFDisplay), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 text-blue-500 animate-spin" /></div>,
});

export default function SampleDocumentsViewer() {
  const [selectedSample, setSelectedSample] = useState<SampleDocument>(sampleDocuments[0]);
  const [numPages, setNumPages] = useState<number | null>(null);
  const { containerRef, containerWidth } = useContainerWidth();

  useEffect(() => {
    // Para asegurar que el worker de PDF.js se cargue correctamente en producción (Vercel),
    // es más robusto usar una CDN. La configuración con `import.meta.url` a menudo falla
    // en los builds de producción de Next.js.
    // Usamos la versión del worker que corresponde a la versión de pdfjs que react-pdf utiliza.
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  // Maneja los errores de renderizado de la página del PDF.
  // La AbortException es común y esperada cuando se cambia de documento rápidamente,
  // ya que la tarea de renderizado anterior se cancela. La ignoramos para limpiar la consola.
  function onPageRenderError(error: Error) {
    if (error.name === 'AbortException') {
      return; // Ignorar errores de aborto, es un comportamiento esperado.
    }
    console.error('Error al renderizar una página del PDF:', error);
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explora Nuestros Informes de Muestra
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Visualiza la calidad y el detalle de los documentos que puedes generar. Selecciona un ejemplo para verlo directamente aquí.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          {/* Tabs para seleccionar el documento */}
          <div className="flex justify-center flex-wrap gap-2 mb-8">
            {sampleDocuments.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedSample(doc);
                  setNumPages(null); // Reset pages count on change
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  selectedSample.id === doc.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {doc.title}
              </button>
            ))}
          </div>

          {/* Contenedor del visualizador de PDF */}
          <div className="relative h-[600px] w-full bg-white dark:bg-gray-800/50 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSample.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                ref={containerRef}
                className="absolute inset-0 overflow-y-auto p-4"
              >
                <DynamicPDFDisplay
                  pdfUrl={selectedSample.pdfUrl}
                  containerWidth={containerWidth}
                  numPages={numPages}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  onPageRenderError={onPageRenderError}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
