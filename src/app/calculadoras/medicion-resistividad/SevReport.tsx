'use client';

import React, { useState, useEffect, useRef, useCallback, DragEvent } from 'react';
import Image from 'next/image';
import Chart, { type Chart as ChartType } from 'chart.js/auto';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Definición de Tipos ---
interface Measurement {
  id: number;
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

interface DocWithLastTable extends jsPDF {
  lastAutoTable: { finalY: number };
}

type DocInternal = {
  getNumberOfPages: () => number;
};

// --- Componente Principal ---
export default function SevReport() {
  // Estado para los datos del proyecto
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('');
  const [operator, setOperator] = useState('');
  const [equipmentBrand, setEquipmentBrand] = useState('');
  const [equipmentModel, setEquipmentModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [lastCalibration, setLastCalibration] = useState('');
  const [interesado, setInteresado] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));

  // Estado para las mediciones de campo
  const [aVal, setAVal] = useState<number | '' > ('');
  const [lVal, setLVal] = useState<number | '' > ('');
  const [rVal, setRVal] = useState<number | '' > ('');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  // Estado para el anexo de imágenes
  const [annexImages, setAnnexImages] = useState<AnnexImage[]>([]);
  const [editingImage, setEditingImage] = useState<{ index: number; description: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
  const calculateMeasurement = (a: number, L: number, R: number): Omit<Measurement, 'id'> => {
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
    const newMeasurement: Measurement = {
      id: Date.now(),
      ...calculateMeasurement(a, L, R)
    };
    setMeasurements(prev => [...prev, newMeasurement]);
    setAVal(''); setLVal(''); setRVal('');
  };

  const handleUpdateMeasurement = () => {
    if (editId === null) return;
    const a = parseFloat(String(aVal));
    const L = parseFloat(String(lVal));
    const R = parseFloat(String(rVal));
    if (isNaN(a) || isNaN(L) || isNaN(R) || a <= 0 || L <= 0 || R < 0 || L <= (a / 2)) {
      alert("Verifique los valores: a > 0, L > a/2 y R ≥ 0.");
      return;
    }
    setMeasurements(prev => prev.map(m => m.id === editId ? { ...m, ...calculateMeasurement(a, L, R) } : m));
    cancelEdit();
  };

  const editRow = (id: number) => {
    const measurementToEdit = measurements.find(m => m.id === id);
    if (!measurementToEdit) return;

    setEditId(id);
    setAVal(measurementToEdit.a);
    setLVal(measurementToEdit.L);
    setRVal(measurementToEdit.R);

    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightEdit(true);
    setTimeout(() => {
      setHighlightEdit(false);
    }, 1200); // Duración de la animación
  };

  const deleteRow = (id: number) => {
    if (!confirm("¿Eliminar esta medición?")) return;
    setMeasurements(prev => prev.filter(m => m.id !== id));
    if (editId === id) {
        cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setAVal(''); setLVal(''); setRVal('');
  };

  // --- Lógica de Imágenes ---
    const handleImageChange = (files: FileList | null) => {
        if (!files) return;

        const newImagePromises = Array.from(files).map(file => {
            return fileToDataURL(file).then(dataUrl => ({ dataUrl, name: file.name, desc: '' }));
        });

        Promise.all(newImagePromises).then(newImages => {
            setAnnexImages(prev => [...prev, ...newImages]);
        });
    };

    const updateImageDescription = (imageIndex: number, description: string) => {
        setAnnexImages(prev => prev.map((img, idx) => 
            idx === imageIndex ? { ...img, desc: description } : img
        ));
    };

    const deleteAnnexImage = (index: number) => {
        setAnnexImages(prev => prev.filter((_, i) => i !== index));
        if (uploadImagesRef.current) {
            uploadImagesRef.current.value = '';
        }
    };

    const handleEnterEditMode = (index: number, currentDescription: string) => {
        setEditingImage({ index, description: currentDescription });
    };

    const handleSaveDescription = () => {
        if (editingImage) {
            updateImageDescription(editingImage.index, editingImage.description);
            setEditingImage(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingImage(null);
    };

    const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleImageChange(files);
        }
    };

  const clearImages = () => {
    if (!annexImages.length || !confirm("¿Eliminar todas las imágenes del anexo?")) return;
    setAnnexImages([]);
    if (uploadImagesRef.current) {
        uploadImagesRef.current.value = '';
    }
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

    const interesadoVal = interesado || "No especificado";
    const proj = projectName || "No especificado";
    const loc = location || "No especificada";
    const oper = operator || "No especificado";
    const fechaVal = fecha ? new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "No especificada";
    const horaVal = hora || "No especificada";
    const brand = equipmentBrand || "No especificada";
    const model = equipmentModel || "No especificado";
    const serial = serialNumber || "No especificado";
    const calib = lastCalibration ? new Date(lastCalibration + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "No especificada";
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
      const pageMargin = 15;
      const pageWidth = doc.internal.pageSize.getWidth() - pageMargin * 2;
      const pageHeight = doc.internal.pageSize.height;

      // --- Portada ---
      doc.setDrawColor(0, 86, 179); 
      doc.setLineWidth(1.5);
      doc.rect(5, 5, doc.internal.pageSize.width - 10, pageHeight - 10);
      doc.setFont('helvetica', 'bold'); 
      doc.setFontSize(24);
      doc.text('Informe de Sondeo Eléctrico Vertical (SEV)', doc.internal.pageSize.width / 2, 60, { align: 'center' });
      doc.setFontSize(18); 
      doc.text('Método Schlumberger', doc.internal.pageSize.width / 2, 72, { align: 'center' });
      
      const detailsBody = [
          [{ content: 'Interesado:', styles: { fontStyle: 'bold' as const } }, interesadoVal],
          [{ content: 'Proyecto:', styles: { fontStyle: 'bold' as const } }, proj],
          [{ content: 'Ubicación:', styles: { fontStyle: 'bold' as const } }, loc],
          [{ content: 'Operador:', styles: { fontStyle: 'bold' as const } }, oper],
          [{ content: 'Fecha de Medición:', styles: { fontStyle: 'bold' as const } }, fechaVal],
          [{ content: 'Hora de Medición:', styles: { fontStyle: 'bold' as const } }, horaVal],
          [{ content: 'Fecha de Emisión:', styles: { fontStyle: 'bold' as const } }, date],
          [{ content: 'Marca del equipo:', styles: { fontStyle: 'bold' as const } }, brand],
          [{ content: 'Modelo:', styles: { fontStyle: 'bold' as const } }, model],
          [{ content: 'N° Serie:', styles: { fontStyle: 'bold' as const } }, serial],
          [{ content: 'Última calibración:', styles: { fontStyle: 'bold' as const } }, calib],
      ];

      autoTable(doc, {
        startY: 100,
        body: detailsBody,
        theme: 'plain',
        styles: { fontSize: 12, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 50 } },
        margin: { left: pageMargin, right: pageMargin }
      });

      // --- Contenido ---
      doc.addPage();
      let yPosition = pageMargin + 10;

      // --- Gráfico ---
      doc.setFontSize(16);
      doc.setTextColor(50);
      doc.text("2. Curva de Campo", pageMargin, yPosition);
      yPosition += 2;
      const chartHeight = (pageWidth * offscreenCanvas.height) / offscreenCanvas.width;
      doc.setDrawColor(200); // Gris claro
      doc.rect(pageMargin, yPosition, pageWidth, chartHeight);
      doc.addImage(chartImage, 'PNG', pageMargin, yPosition, pageWidth, chartHeight);
      yPosition += chartHeight + 10;

      // --- Tabla de Datos ---
      const tableHeaders = [["N°", "a (m)", "n", "L (m)", "R (ohm)", "Resistividad Sch (ohm-m)"]];
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

      doc.setFontSize(16);
      doc.setTextColor(50);
      doc.text("3. Tabla de Datos y Resultados", pageMargin, yPosition);
      yPosition += 2;

      autoTable(doc, {
        head: tableHeaders,
        body: tableBody,
        startY: yPosition,
        margin: { left: pageMargin, right: pageMargin },
        headStyles: { fillColor: [224, 224, 224], textColor: 20, fontStyle: 'bold' as const, font: 'helvetica' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { halign: 'center', font: 'helvetica' },
      });
      yPosition = (doc as DocWithLastTable).lastAutoTable.finalY + 10;

      // --- Anexo de Imágenes ---
      if (annexImages.length > 0) {
        if (yPosition + 20 > pageHeight - pageMargin) {
            doc.addPage();
            yPosition = pageMargin + 10;
        }
        doc.setFontSize(16);
        doc.setTextColor(50);
        doc.text("4. Anexo de Imágenes", pageMargin, yPosition);
        yPosition += 10;
        
        annexImages.forEach((img, idx) => {
          const imgWidth = 80;
          const imgHeight = (imgWidth * 3) / 4; // Aspect ratio 4:3
          const xPos = (idx % 2 === 0) ? pageMargin : pageMargin + imgWidth + 10;

          if (yPosition + imgHeight + 20 > pageHeight - pageMargin) {
            doc.addPage();
            yPosition = pageMargin + 10;
          }

          doc.addImage(img.dataUrl, 'PNG', xPos, yPosition, imgWidth, imgHeight);
          doc.setFontSize(10);
          doc.setTextColor(80);
          doc.text(`Figura ${idx + 1}: ${escapeHtml(img.desc || "(sin descripción)")}`, xPos, yPosition + imgHeight + 5, { maxWidth: imgWidth });

          if (idx % 2 !== 0) {
            yPosition += imgHeight + 20;
          }
        });
      }
      
      // Encabezados y Pies de Página
      const totalPages = (doc.internal as unknown as DocInternal).getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(9); doc.setTextColor(150);
          doc.text(`Informe de Sondeo Eléctrico Vertical (SEV) - ${proj}`, pageMargin, 10);
          doc.line(pageMargin, 12, pageWidth + pageMargin, 12);
          const footerText = `Página ${i} de ${totalPages}`;
          doc.line(pageMargin, pageHeight - 12, pageWidth + pageMargin, pageHeight - 12);
          doc.text(footerText, doc.internal.pageSize.width / 2, pageHeight - 8, { align: 'center' });
          doc.setTextColor(0);
      }

      doc.save(`Informe_SEV_${proj.replace(/ /g, '_')}.pdf`);

    }, 400);
  }, [measurements, projectName, location, operator, annexImages, equipmentBrand, equipmentModel, serialNumber, lastCalibration, interesado, fecha, hora]);

  const handleClearAll = () => {
    if (!confirm("¿Eliminar todos los datos del proyecto?")) return;
    setMeasurements([]);
    cancelEdit();
    setProjectName('');
    setLocation('');
    setOperator('');
    setEquipmentBrand('');
    setEquipmentModel('');
    setSerialNumber('');
    setLastCalibration('');
    setInteresado('');
    setFecha(new Date().toISOString().split('T')[0]);
    setHora(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    setAnnexImages([]);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            {/* Columna 1: Info Proyecto */}
            <div className="space-y-4">
              <div>
                <label className="form-label" htmlFor="interesado">Interesado</label>
                <input id="interesado" type="text" value={interesado} onChange={e => setInteresado(e.target.value)} placeholder="Nombre del interesado" className="form-input" />
              </div>
              <div>
                <label className="form-label" htmlFor="projectName">Proyecto</label>
                <input id="projectName" type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Nombre del Proyecto" className="form-input" />
              </div>
              <div>
                <label className="form-label" htmlFor="location">Ubicación</label>
                <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ubicación" className="form-input" />
              </div>
            </div>
            {/* Columna 2: Info Ejecución */}
            <div className="space-y-4">
              <div>
                <label className="form-label" htmlFor="operator">Operador</label>
                <input id="operator" type="text" value={operator} onChange={e => setOperator(e.target.value)} placeholder="Operador" className="form-input" />
              </div>
              <div>
                <label className="form-label" htmlFor="fecha">Fecha Medición</label>
                <input id="fecha" type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label" htmlFor="hora">Hora</label>
                <input id="hora" type="time" value={hora} onChange={e => setHora(e.target.value)} className="form-input" />
              </div>
            </div>
            {/* Columna 3: Info Equipo */}
            <div className="space-y-4">
              <div>
                <label className="form-label" htmlFor="equipmentBrand">Marca del equipo</label>
                <input id="equipmentBrand" type="text" value={equipmentBrand} onChange={e => setEquipmentBrand(e.target.value)} placeholder="Marca del equipo" className="form-input" />
              </div>
              <div>
                <label className="form-label" htmlFor="equipmentModel">Modelo</label>
                <input id="equipmentModel" type="text" value={equipmentModel} onChange={e => setEquipmentModel(e.target.value)} placeholder="Modelo" className="form-input" />
              </div>
              <div>
                <label className="form-label" htmlFor="serialNumber">N° Serie</label>
                <input id="serialNumber" type="text" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="N° Serie" className="form-input" />
              </div>
              <div>
                <label className="form-label" htmlFor="lastCalibration">Última calibración</label>
                <input id="lastCalibration" type="date" value={lastCalibration} onChange={e => setLastCalibration(e.target.value)} className="form-input" />
              </div>
            </div>
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
                  {editId === null ? (
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
                    <label 
                        htmlFor="file-upload-sev"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Haz clic para cargar</span> o arrastra y suelta</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
                        </div>
                        <input id="file-upload-sev" ref={uploadImagesRef} type="file" className="hidden" multiple accept="image/*" onChange={e => handleImageChange(e.target.files)} />
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                        {annexImages.map((image, index) => (
                            <div key={index} className="card overflow-hidden p-0">
                                <div className="relative h-40 w-full group">
                                    <Image src={image.dataUrl} alt={`Preview ${index}`} layout="fill" objectFit="cover" />
                                    <div className="absolute top-1 right-1">
                                        <button className="btn  btn-sm bg-red-500 hover:bg-red-600 cursor-pointer h-7 w-7 opacity-70 group-hover:opacity-100 flex items-center justify-center" onClick={() => deleteAnnexImage(index)}>
                                            <span className="text-lg ">×</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-2 flex-grow flex flex-col justify-between">
                                    {editingImage?.index === index ? (
                                        <div className="space-y-2">
                                            <textarea
                                                autoFocus
                                                value={editingImage.description}
                                                onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                                                className="form-input text-sm"
                                                rows={3}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button className="btn btn-primary btn-sm hover:bg-amber-600" onClick={handleCancelEdit}>Cancelar</button>
                                                <button className="btn btn-secondary btn-sm" onClick={handleSaveDescription}>Guardar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 flex flex-col h-full">
                                            {image.desc ? (
                                                <div className="flex flex-col h-full justify-between flex-grow">
                                                    <div className="form-input text-sm min-h-[70px] flex-grow p-2">{image.desc}</div>
                                                    <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-700">
                                                        <button className="btn btn-secondary btn-sm" onClick={() => handleEnterEditMode(index, image.desc)}>Editar</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button className="btn btn-secondary w-full mt-auto" onClick={() => handleEnterEditMode(index, image.desc)}>Agregar descripción</button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                     <button type="button" className="btn btn-primary hover:bg-red-600" onClick={clearImages}>Borrar todas las fotos</button>
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
                    <tr key={m.id} className="border-b dark:border-gray-700">
                      <td className="px-4 py-2 text-center">{i + 1}</td>
                      <td className="px-4 py-2 text-center">{m.a.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">{m.n.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">{m.L.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">{m.R.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">{m.rho_sch.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button type="button" className="btn bg-amber-600 p-2 text-s  hover:bg-amber-800 cursor-pointer text-white" onClick={() => editRow(m.id)}>✎</button>
                          <button type="button" className="btn bg-red-600 p-2 text-s text-white hover:bg-red-800 cursor-pointer" onClick={() => deleteRow(m.id)}>×</button>
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