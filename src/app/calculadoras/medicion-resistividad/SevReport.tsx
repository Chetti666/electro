"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chart, { type Chart as ChartType } from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Definición de Tipos ---
interface Measurement {
  a: number;
  L: number;
  R: number;
  n: number;
  rho_sch: number;
  xPlot: number;
}

interface AnnexImage {
  dataUrl: string;
  name: string;
  desc: string;
}

// --- Componente Principal ---
export default function SevReport() {
  // Estado para los datos del proyecto
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [operator, setOperator] = useState('');

  // Estado para las mediciones de campo
  const [aVal, setAVal] = useState<number | ''>('');
  const [lVal, setLVal] = useState<number | ''>('');
  const [rVal, setRVal] = useState<number | ''>('');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Estado para el anexo de imágenes
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [imageDescription, setImageDescription] = useState('');
  const [annexImages, setAnnexImages] = useState<AnnexImage[]>([]);
  const captureCameraRef = useRef<HTMLInputElement>(null);
  const uploadImagesRef = useRef<HTMLInputElement>(null);
  const [highlightEdit, setHighlightEdit] = useState(false);

  // Referencias para el gráfico
  const chartContainer = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartType | null>(null);
  // Referencia para el formulario de medidas
  const formCardRef = useRef<HTMLDivElement>(null);

  // --- Utilidades ---
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const escapeHtml = (str: string): string => {
    return (str || "").replace(/[&<>]/g, s => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
    }[s] || s));
  };

  // --- Lógica de Mediciones ---
  const calculateMeasurement = (a: number, L: number, R: number): Measurement => {
    const n = (L - (a / 2)) / a;
    const rho_sch = Math.PI * R * n * a * (n + 1);
    return { a, L, R, n, rho_sch, xPlot: L };
  };

  const handleAddMeasurement = () => {
    const a = parseFloat(String(aVal));
    const L = parseFloat(String(lVal));
    const R = parseFloat(String(rVal));
    if (isNaN(a) || isNaN(L) || isNaN(R) || a <= 0 || L <= 0 || R < 0 || L <= (a / 2)) {
      alert("Verifique los valores: a > 0, L > a/2 y R ≥ 0.");
      return;
    }
    const newMeasurement = calculateMeasurement(a, L, R);
    setMeasurements(prev => [...prev, newMeasurement]);
    setAVal(''); setLVal(''); setRVal('');
  };

  const handleUpdateMeasurement = () => {
    if (editIndex === null) return;
    const a = parseFloat(String(aVal));
    const L = parseFloat(String(lVal));
    const R = parseFloat(String(rVal));
    if (isNaN(a) || isNaN(L) || isNaN(R) || a <= 0 || L <= 0 || R < 0 || L <= (a / 2)) {
      alert("Verifique los valores: a > 0, L > a/2 y R ≥ 0.");
      return;
    }
    const updatedMeasurement = calculateMeasurement(a, L, R);
    const newMeasurements = [...measurements];
    newMeasurements[editIndex] = updatedMeasurement;
    setMeasurements(newMeasurements);
    cancelEdit();
  };

  const editRow = (index: number) => {
    const sortedMeasurements = [...measurements].sort((a, b) => a.xPlot - b.xPlot);
    const originalIndex = measurements.findIndex(m => m === sortedMeasurements[index]);
    if (originalIndex === -1) return;

    setEditIndex(originalIndex);
    const m = measurements[originalIndex];
    setAVal(m.a);
    setLVal(m.L);
    setRVal(m.R);

    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightEdit(true);
    setTimeout(() => {
      setHighlightEdit(false);
    }, 1200); // Duración de la animación
  };

  const deleteRow = (index: number) => {
    if (!confirm("¿Eliminar esta medición?")) return;
    const sortedMeasurements = [...measurements].sort((a, b) => a.xPlot - b.xPlot);
    const itemToDelete = sortedMeasurements[index];
    setMeasurements(prev => prev.filter(m => m !== itemToDelete));
    if (editIndex !== null) {
        cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setAVal(''); setLVal(''); setRVal('');
  };

  // --- Lógica de Imágenes ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setPendingFiles(Array.from(e.target.files));
  };

  const handleAddImage = async () => {
    if (!pendingFiles.length) {
      alert("Selecciona al menos una imagen (cámara o archivos) antes de agregar.");
      return;
    }
    const newImages: AnnexImage[] = [];
    for (const file of pendingFiles) {
      const dataUrl = await fileToDataURL(file);
      newImages.push({ dataUrl, name: file.name || "captura", desc: imageDescription });
    }
    setAnnexImages(prev => [...prev, ...newImages]);
    setPendingFiles([]);
    setImageDescription('');
    if (captureCameraRef.current) captureCameraRef.current.value = "";
    if (uploadImagesRef.current) uploadImagesRef.current.value = "";
  };

  const deleteAnnexImage = (index: number) => {
    setAnnexImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    if (!annexImages.length || !confirm("¿Eliminar todas las imágenes del anexo?")) return;
    setAnnexImages([]);
  };

  // --- Lógica de Gráfico y UI ---
  useEffect(() => {
    if (!chartContainer.current) return;

    const dataSet = measurements
      .slice()
      .sort((a, b) => a.xPlot - b.xPlot)
      .map(m => ({ x: m.xPlot, y: m.rho_sch }));

    if (chartInstance.current) {
      chartInstance.current.data.datasets[0].data = dataSet;
      chartInstance.current.update();
    } else {
      const X_TICKS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50];
      const Y_TICKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000, 3000];

      chartInstance.current = new Chart(chartContainer.current, {
        type: "line",
        data: {
          datasets: [{
            label: "ρ Sch (Ω·m)",
            data: dataSet,
            borderColor: "rgb(239 68 68)", // text-red-500
            pointBackgroundColor: "rgb(239 68 68)",
            borderWidth: 2,
            pointRadius: 5,
            showLine: true,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          color: "rgb(107 114 128)", // text-gray-500
          plugins: {
            title: {
              display: false,
            },
            legend: {
              position: "top",
              labels: {
                color: "rgb(107 114 128)", // text-gray-500
              }
            },
          },
          scales: {
            x: {
              type: "logarithmic",
              min: 0.1,
              max: 50,
              afterBuildTicks: (scale) => {
                scale.ticks = X_TICKS.map((v) => ({ value: v }));
              },
              ticks: {
                color: "rgb(107 114 128)", // text-gray-500
                callback: (value) => `${value}`,
              },
              title: {
                display: true,
                text: "L (m)",
                color: "rgb(156 163 175)", // text-gray-400
                font: { size: 14 },
              },
              grid: {
                color: "rgba(156, 163, 175, 0.4)", // text-gray-400 with more alpha
              },
            },
            y: {
              type: "logarithmic",
              min: 1,
              max: 3000,
              afterBuildTicks: (scale) => {
                scale.ticks = Y_TICKS.map((v) => ({ value: v }));
              },
              ticks: {
                color: "rgb(107 114 128)", // text-gray-500
                callback: (value) => `${value}`,
              },
              title: {
                display: true,
                text: "ρ Sch (Ω·m)",
                color: "rgb(156 163 175)", // text-gray-400
                font: { size: 14 },
              },
              grid: {
                color: "rgba(156, 163, 175, 0.4)", // text-gray-400 with more alpha
              },
            }
          },
          animation: { duration: 800 }
        }
      });
    }
  }, [measurements]);

  // --- Generación de Informe ---
  const handleGenerateReport = useCallback(() => {
    if (measurements.length === 0) {
      alert("No hay mediciones para generar un informe.");
      return;
    }

    const proj = projectName || "No especificado";
    const loc = location || "No especificada";
    const oper = operator || "No especificado";
    const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 1400;
    offscreenCanvas.height = 900;
    const offCtx = offscreenCanvas.getContext('2d');

    if (!offCtx || !chartInstance.current) return;

    const reportOptions = JSON.parse(JSON.stringify(chartInstance.current.options));
    reportOptions.animation = false;
    reportOptions.responsive = false;
    // Force light theme for PDF report
    reportOptions.color = "rgba(0, 0, 0, 0.92)";
    reportOptions.scales.x.ticks.color = "rgba(0, 0, 0, 0.92)";
    reportOptions.scales.y.ticks.color = "rgba(0, 0, 0, 0.92)";
    reportOptions.scales.x.title.color = "rgba(0, 0, 0, 0.92)";
    reportOptions.scales.y.title.color = "rgba(0, 0, 0, 0.92)";
    reportOptions.scales.x.grid.color = "rgba(0, 0, 0, 0.92)"; // Forzar grilla visible en PDF
    reportOptions.scales.y.grid.color = "rgba(0, 0, 0, 0.92)"; // Forzar grilla visible en PDF
    
    new Chart(offCtx, {
      type: 'line',
      data: chartInstance.current.data,
      options: reportOptions
    });

    setTimeout(() => {
      const chartImage = offscreenCanvas.toDataURL('image/png', 1.0);

      const doc = new jsPDF('p', 'mm', 'a4');
      // Establecer la fuente para todo el documento para asegurar el soporte de caracteres Unicode
      doc.setFont('helvetica');
      const pageMargin = 15;
      const pageWidth = doc.internal.pageSize.getWidth() - pageMargin * 2;

      // --- Encabezado ---
      doc.setFontSize(22);
      doc.text("Informe de Sondeo Eléctrico Vertical (SEV)", doc.internal.pageSize.getWidth() / 2, pageMargin + 5, { align: 'center' });
      doc.setFontSize(16);
      doc.setTextColor(100);
      doc.text("Método Schlumberger", doc.internal.pageSize.getWidth() / 2, pageMargin + 12, { align: 'center' });
      doc.setDrawColor(50);
      doc.line(pageMargin, pageMargin + 18, pageWidth + pageMargin, pageMargin + 18);

      // --- Datos del Proyecto ---
      doc.setFontSize(16);
      doc.setTextColor(50);
      doc.text("1. Datos del Proyecto", pageMargin, pageMargin + 30);
      autoTable(doc, {
        startY: pageMargin + 32,
        body: [
          [{ content: 'Proyecto:', styles: { fontStyle: 'bold' } }, proj],
          [{ content: 'Ubicación:', styles: { fontStyle: 'bold' } }, loc],
          [{ content: 'Operador:', styles: { fontStyle: 'bold' } }, oper],
          [{ content: 'Fecha de Emisión:', styles: { fontStyle: 'bold' } }, date],
        ],
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 1.5 },
        columnStyles: { 0: { cellWidth: 40 } },
      });

      // --- Gráfico ---
      const chartY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(16);
      doc.setTextColor(50);
      doc.text("2. Curva de Campo", pageMargin, chartY);
      const chartHeight = (pageWidth * offscreenCanvas.height) / offscreenCanvas.width;
      // Añadir borde al gráfico
      doc.setDrawColor(200); // Gris claro
      doc.rect(pageMargin, chartY + 2, pageWidth, chartHeight);
      doc.addImage(chartImage, 'PNG', pageMargin, chartY + 2, pageWidth, chartHeight);

      // --- Tabla de Datos ---
      const tableHeaders = [["N°", "a (m)", "n", "L (m)", "R (ohm)", "Resistividad Sch (ohm-m)"]]; // ρ y Ω
      const tableBody = measurements
        .slice()
        .sort((a, b) => a.xPlot - b.xPlot)
        .map((m, i) => [
          i + 1,
          m.a.toFixed(2),
          m.n.toFixed(2),
          m.L.toFixed(2),
          m.R.toFixed(2),
          m.rho_sch.toFixed(2),
        ]);

      const tableStartY = chartY + chartHeight + 20; // Aumentar espacio después del gráfico
      doc.setFontSize(16);
      doc.setTextColor(50);
      doc.text("3. Tabla de Datos y Resultados", pageMargin, tableStartY - 10);

      autoTable(doc, {
        head: tableHeaders,
        body: tableBody,
        startY: tableStartY, // Iniciar la tabla después del título
        margin: { left: pageMargin, right: pageMargin },
        didDrawPage: (data) => {
          if (data.pageNumber === 1) return;
          // En páginas nuevas, dibujar el título con un margen superior
          doc.setFontSize(16);
          doc.setTextColor(50);
          
        },
        headStyles: { fillColor: [224, 224, 224], textColor: 20, fontStyle: 'bold', font: 'helvetica' }, // Mantenemos esto por si acaso
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { halign: 'center', font: 'helvetica' }, // Y esto también
      });

      // --- Anexo de Imágenes ---
      if (annexImages.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(50);
        doc.text("4. Anexo de Imágenes", pageMargin, pageMargin);
        let yPos = pageMargin + 10;
        annexImages.forEach((img, idx) => {
          const imgWidth = 80;
          const imgHeight = (imgWidth * 3) / 4; // Aspect ratio 4:3
          const xPos = (idx % 2 === 0) ? pageMargin : pageMargin + imgWidth + 10;

          if (yPos + imgHeight + 20 > doc.internal.pageSize.getHeight()) {
            doc.addPage();
            yPos = pageMargin;
          }

          doc.addImage(img.dataUrl, 'PNG', xPos, yPos, imgWidth, imgHeight);
          doc.setFontSize(10);
          doc.setTextColor(80);
          doc.text(`Figura ${idx + 1}: ${escapeHtml(img.desc || "(sin descripción)")}`, xPos, yPos + imgHeight + 5, { maxWidth: imgWidth });

          if (idx % 2 !== 0) {
            yPos += imgHeight + 20;
          }
        });
      }

      doc.save(`Informe_SEV_${proj.replace(/ /g, '_')}.pdf`);

    }, 400);
  }, [measurements, projectName, location, operator, annexImages]);

  const handleClearAll = () => {
    if (!confirm("¿Eliminar todos los datos del proyecto?")) return;
    setMeasurements([]);
    cancelEdit();
    setProjectName('');
    setLocation('');
    setOperator('');
    setAnnexImages([]);
    setPendingFiles([]);
    if (chartInstance.current) {
        chartInstance.current.data.datasets[0].data = [];
        chartInstance.current.update();
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes highlight-blink {
          0%, 50%, 100% { background-color: transparent; }
          25%, 75% { background-color: var(--highlight-bg, rgba(251, 191, 36, 0.2)); }
        }
        .highlight-animation {
          animation: highlight-blink 1.2s ease-in-out;
        }
        .dark .highlight-animation {
          --input-border-color: #4B5563;
          /* Un color de fondo sutil para el modo oscuro */
          --highlight-bg: rgba(245, 158, 11, 0.15);
        }
      `}</style>
      <div className="space-y-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Datos del Proyecto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Nombre del Proyecto" className="form-input" />
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ubicación" className="form-input" />
            <input type="text" value={operator} onChange={e => setOperator(e.target.value)} placeholder="Operador" className="form-input" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div id="medidas-form" ref={formCardRef} className="lg:col-span-2 space-y-8">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Medidas de Campo</h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Ingrese a, L y R según el esquema del documento.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="number" value={aVal} onChange={e => setAVal(e.target.value === '' ? '' : Number(e.target.value))} step="any" placeholder="a (m)" className={`form-input ${highlightEdit ? 'highlight-animation' : ''}`} />
                  <input type="number" value={lVal} onChange={e => setLVal(e.target.value === '' ? '' : Number(e.target.value))} step="any" placeholder="L (m)" className={`form-input ${highlightEdit ? 'highlight-animation' : ''}`} />
                  <input type="number" value={rVal} onChange={e => setRVal(e.target.value === '' ? '' : Number(e.target.value))} step="any" placeholder="R (Ω)" className={`form-input ${highlightEdit ? 'highlight-animation' : ''}`} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {editIndex === null ? (
                    <button className="btn btn-primary" onClick={handleAddMeasurement}>Agregar medición</button>
                  ) : (
                    <>
                      <button className="btn btn-primary" onClick={handleUpdateMeasurement}>Actualizar</button>
                      <button className="btn btn-accent" onClick={cancelEdit}>Cancelar</button>
                    </>
                  )}
                </div>
                <div className="formula" dangerouslySetInnerHTML={{ __html: 'ρsch = π · R · n · a · (n + 1)<br />con n = (L − a/2) / a' }} />
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Anexo de Imágenes</h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Puedes tomar una foto con la cámara o cargarla desde archivos. Agrega una descripción opcional.</p>
                <input type="file" ref={captureCameraRef} onChange={handleFileChange} accept="image/*" capture="environment" className="file-input" />
                <input type="file" ref={uploadImagesRef} onChange={handleFileChange} accept="image/*" multiple className="file-input" />
                <input type="text" value={imageDescription} onChange={e => setImageDescription(e.target.value)} placeholder="Descripción de la imagen (opcional)" className="form-input" />
                <div className="flex gap-2 flex-wrap">
                  <button type="button" className="btn btn-primary" onClick={handleAddImage}>Agregar Imagen</button>
                  <button type="button" className="btn btn-secondary" onClick={clearImages}>Limpiar Anexo</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {annexImages.map((img, i) => (
                    <div key={i} className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <img src={img.dataUrl} alt="anexo" className="w-full h-32 object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs truncate">
                        {escapeHtml(img.desc || "(sin descripción)")}
                      </div>
                      <button type="button" className="absolute top-1 right-1 btn btn-danger p-1 h-6 w-6 text-xs" onClick={() => deleteAnnexImage(i)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Acciones</h2>
              <div className="flex flex-col space-y-3">
              <button type="button" className="btn btn-primary w-full justify-center" onClick={handleGenerateReport}>Generar Informe (PDF)</button>
              <button type="button" className="btn btn-accent w-full justify-center" onClick={handleClearAll}>Limpiar Todo</button>
            </div>
          </div>
        </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Gráfico SEV (Log-Log)</h2>
          <div className="relative w-full h-[700px] md:h-[800px]">
            <canvas ref={chartContainer}></canvas>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Tabla de Resultados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-4 py-2 text-center">N° </th>
                  <th className="px-4 py-2 text-center">a (m)</th>
                  <th className="px-4 py-2 text-center">n</th>
                  <th className="px-4 py-2 text-center">L (m)</th>
                  <th className="px-4 py-2 text-center">R (Ω)</th>
                  <th className="px-4 py-2 text-center">ρ Sch (Ω·m)</th>
                  <th className="px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {measurements
                  .slice()
                  .sort((a, b) => a.xPlot - b.xPlot)
                  .map((m, i) => (
                    <tr key={`${m.xPlot}-${m.rho_sch}-${i}`} className="border-b dark:border-gray-700">
                      <td className="px-4 py-2 text-center">{i + 1}</td>
                      <td className="px-4 py-2 text-center">{m.a.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">{m.n.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">{m.L.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">{m.R.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">{m.rho_sch.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button type="button" className="btn btn-warning p-2 text-s text-amber-600 hover:text-amber-700 cursor-pointer" onClick={() => editRow(i)}>✎</button>
                          <button type="button" className="btn btn-danger p-2 text-s text-red-600 hover:text-red-700 cursor-pointer" onClick={() => deleteRow(i)}>×</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}