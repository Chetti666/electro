'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
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
    id: 'sample-presupuesto',
    title: 'Presupuesto',
    description: 'Ejemplo de un presupuesto generado por nuestra plataforma.',
    pdfUrl: '/samples/presupuesto-ejemplo.pdf',
  },
 
];
 
// Hook personalizado para medir el ancho de un elemento
function useContainerWidth() {
  const [containerWidth, setContainerWidth] = useState<number | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
 
    const updateWidth = () => {
      setContainerWidth(container.offsetWidth);
    };
 
    updateWidth();
 
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);
 
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef.current]); // Depender del elemento DOM actual
 
  return { containerRef, containerWidth };
}
export default function SampleDocumentsViewer() {
  const [selectedSample, setSelectedSample] = useState<SampleDocument>(sampleDocuments[0]);
  const [numPages, setNumPages] = useState<number | null>(null);
  const { containerRef, containerWidth } = useContainerWidth();

  useEffect(() => {
    // This is the recommended way to set up the worker for Next.js and other bundlers.
    // It ensures the worker is loaded from the correct path.
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
  }, []);


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
                <Document file={selectedSample.pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading={<div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 text-blue-500 animate-spin" /></div>} error={<div className="flex items-center justify-center h-full text-red-500">Error al cargar el PDF. Asegúrate que el archivo existe en <code>public/samples/</code>.</div>}>
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} width={containerWidth ? containerWidth - 32 : undefined} className="mb-4 shadow-md" />
                  ))}
                </Document>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}