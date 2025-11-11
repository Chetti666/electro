'use client';

import React, { useState, useEffect, useRef, useCallback, DragEvent } from 'react';
import Image from 'next/image';
import Chart, { type Chart as ChartType } from 'chart.js/auto';
import imageCompression from 'browser-image-compression';
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
  width: number;
  height: number;
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
    const handleImageChange = async (files: FileList | null) => {
        if (!files) return;

        const imageProcessingOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
        };

        const newImagePromises = Array.from(files).map(async (file) => {
            try {
                const compressedFile = await imageCompression(file, imageProcessingOptions);
                const dataUrl = await imageCompression.getDataUrlFromFile(compressedFile);
                
                // Obtener dimensiones de la imagen corregida
                const dimensions = await new Promise<{width: number, height: number}>(resolve => {
                    const img = document.createElement('img');
                    img.onload = () => resolve({ width: img.width, height: img.height });
                    img.src = dataUrl;
                });

                return { dataUrl, name: file.name, desc: '', ...dimensions };
            } catch (error) {
                console.error("Error al procesar la imagen:", error);
                return new Promise<AnnexImage | null>(resolve => {
                    const reader = new FileReader();
                    reader.onload = event => {
                        const dataUrl = event.target?.result as string;
                        const img = document.createElement('img');
                        img.onload = () => resolve({ dataUrl, name: file.name, desc: '', width: img.width, height: img.height });
                        img.src = dataUrl;
                    };
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                });
            }
        });

        const newImages = await Promise.all(newImagePromises);
        const validImages = newImages.filter((img): img is AnnexImage => img !== null);
        setAnnexImages(prev => [...prev, ...validImages]);
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

    const generatePdfWithChart = (chartImage: string, chartWidthMM: number, chartHeightMM: number) => {
      const doc = new jsPDF('p', 'mm', [210, 279]);
      const pageMargin = 15;
      const pageWidth = doc.internal.pageSize.getWidth() - pageMargin * 2;
      const pageHeight = doc.internal.pageSize.height;

      // Función para aplicar estilo de título
      const applyTitleStyle = (text: string, y: number) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50);
        doc.text(text, pageMargin, y);
        const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
        doc.setDrawColor(0, 86, 179); // Azul
        doc.setLineWidth(0.3);
        doc.line(pageMargin, y + 1, pageMargin + textWidth, y + 1);
        return y + 10; // Devuelve la nueva posición Y
      };

      // --- Portada ---
      doc.setDrawColor(0, 86, 179); 
      doc.setLineWidth(1.5);
      doc.rect(pageMargin, pageMargin - 6, pageWidth, pageHeight - (pageMargin - 6) - pageMargin);
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

      // --- Página del Gráfico ---
      doc.addPage();
      let yPositionChartPage = pageMargin + 10;
      
      yPositionChartPage = applyTitleStyle("2. Curva de Campo", yPositionChartPage - 10);

      // Posicionar el gráfico para dejar espacio para el pie de página
      const chartX = (doc.internal.pageSize.getWidth() - chartWidthMM) / 2;
      const chartY = yPositionChartPage;

      // Asegurarse de que el gráfico no se salga de la página
      if (chartWidthMM > pageWidth || chartHeightMM > pageHeight - chartY - pageMargin) {
        console.warn("El tamaño del gráfico excede el área de la página. Puede que se vea cortado.");
      }

      doc.addImage(chartImage, 'PNG', chartX, chartY, chartWidthMM, chartHeightMM);

      // --- Tabla de Datos ---
      doc.addPage();
      let yPosition = pageMargin + 10;

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

      yPosition = applyTitleStyle("3. Tabla de Datos y Resultados", yPosition);
      
      autoTable(doc, {
        head: tableHeaders,
        body: tableBody,
        startY: yPosition, // Dejar espacio para el pie de página
        margin: { left: pageMargin, right: pageMargin },
        headStyles: { fillColor: [224, 224, 224], textColor: 20, fontStyle: 'bold' as const, font: 'helvetica' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { halign: 'center', font: 'helvetica' },
      });
      yPosition = (doc as DocWithLastTable).lastAutoTable.finalY + 10;

      // --- Anexo de Imágenes ---
      if (annexImages.length > 0) {
        if (yPosition + 20 > pageHeight - (pageMargin + 10)) { // Dejar espacio para el pie de página
            doc.addPage();
            yPosition = pageMargin + 10;
        }
        
        yPosition = applyTitleStyle("4. Anexo de Imágenes", yPosition);
        
        let currentRowMaxHeight = 0;
        annexImages.forEach((img, idx) => {
          const fixedWidth = 80;
          const aspectRatio = img.height / img.width;
          const calculatedHeight = fixedWidth * aspectRatio;
          const xPos = (idx % 2 === 0) ? pageMargin : pageMargin + fixedWidth + 10;

          currentRowMaxHeight = Math.max(currentRowMaxHeight, calculatedHeight);

          if (yPosition + currentRowMaxHeight + 20 > pageHeight - (pageMargin + 10)) { // Dejar espacio para el pie de página
            doc.addPage();
            yPosition = pageMargin + 10;
            currentRowMaxHeight = calculatedHeight; // Reiniciar para la nueva página
          }

          doc.addImage(img.dataUrl, 'PNG', xPos, yPosition, fixedWidth, calculatedHeight);
          doc.setFontSize(10);
          doc.setTextColor(80);
          const figureText = `Figura ${idx + 1}`;
          const descriptionText = img.desc ? `: ${escapeHtml(img.desc)}` : '';
          doc.text(figureText + descriptionText, xPos, yPosition + calculatedHeight + 5, { maxWidth: fixedWidth }); // Usar la altura de la imagen actual para su propio texto

          if (idx % 2 !== 0 || idx === annexImages.length - 1) {
            yPosition += currentRowMaxHeight + 20;
            currentRowMaxHeight = 0; // Reiniciar para la siguiente fila
          }
        });
      }
      
      // Encabezados y Pies de Página
      const totalPages = (doc.internal as unknown as DocInternal).getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(9); doc.setTextColor(150);
          doc.text(`Informe de Sondeo Eléctrico Vertical (SEV) - ${proj}`, pageMargin, pageMargin - 8);
          doc.line(pageMargin, pageMargin - 6, pageWidth + pageMargin, pageMargin - 6);
          const footerText = `Página ${i} de ${totalPages}`;
          doc.line(pageMargin, pageHeight - pageMargin, pageWidth + pageMargin, pageHeight - pageMargin);
          doc.text(footerText, doc.internal.pageSize.width / 2, pageHeight - pageMargin + 4, { align: 'center' });
          doc.setTextColor(0);
      }

      doc.save(`Informe_SEV_${proj.replace(/ /g, '_')}.pdf`);

    }

    // --- Generación del Gráfico para el PDF (Método Mejorado) ---
    if (!chartInstance.current) return;

    const chart = chartInstance.current;
    
    // 1. Calcular dimensiones deseadas en mm
    const xMin = chart.options.scales?.x?.min ?? 0.1;
    const xMax = chart.options.scales?.x?.max ?? 50;
    const yMin = chart.options.scales?.y?.min ?? 1;
    const yMax = chart.options.scales?.y?.max ?? 3000;
    const mmPerDecade = 62.5;
    const xDecades = Math.log10(Number(xMax) / Number(xMin));
    const yDecades = Math.log10(Number(yMax) / Number(yMin));
    const chartWidthMM = xDecades * mmPerDecade;
    const chartHeightMM = yDecades * mmPerDecade;

    // 2. Crear un canvas fuera de pantalla con las proporciones correctas en píxeles
    const offscreenCanvas = document.createElement('canvas');
    const resolutionMultiplier = 6; // Para alta resolución
    offscreenCanvas.width = Math.round(chartWidthMM * resolutionMultiplier);
    offscreenCanvas.height = Math.round(chartHeightMM * resolutionMultiplier);
    const offCtx = offscreenCanvas.getContext('2d');
    if (!offCtx) return;

    // 3. Clonar opciones y configurar para el renderizado del PDF
    const reportOptions = JSON.parse(JSON.stringify(chart.options));
    reportOptions.animation = false;
    reportOptions.responsive = false;
    reportOptions.maintainAspectRatio = false;
    reportOptions.color = "rgba(0, 0, 0, 0.92)";
    if (reportOptions.scales?.x) {
        reportOptions.scales.x.ticks.color = "rgba(0, 0, 0, 0.92)";
        if(reportOptions.scales.x.title) reportOptions.scales.x.title.color = "rgba(0, 0, 0, 0.92)";
        if(reportOptions.scales.x.grid) reportOptions.scales.x.grid.color = "rgba(0, 0, 0, 0.92)";
    }
    if (reportOptions.scales?.y) {
        reportOptions.scales.y.ticks.color = "rgba(0, 0, 0, 0.92)";
        if(reportOptions.scales.y.title) reportOptions.scales.y.title.color = "rgba(0, 0, 0, 0.92)";
        if(reportOptions.scales.y.grid) reportOptions.scales.y.grid.color = "rgba(0, 0, 0, 0.92)";
    }

    // 4. Renderizar el gráfico en el canvas fuera de pantalla
    new Chart(offCtx, {
        type: 'line',
        data: chart.data,
        options: reportOptions,
    });

    // 5. Obtener la imagen y generar el PDF
    setTimeout(() => {
        const chartImage = offscreenCanvas.toDataURL('image/png', 1.0);
        generatePdfWithChart(chartImage, chartWidthMM, chartHeightMM);
    }, 400); // Pequeña espera para asegurar que el gráfico se renderice completamente
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
          --highlight-bg: rgba(245, 158, 11, 0.15);
        }
      `}</style>
      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Datos del Proyecto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
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

          <div id="medidas-form" ref={formCardRef} className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Medidas de Campo</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Ingrese a, L y R según el esquema del documento.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="number" value={aVal} onChange={e => setAVal(e.target.value === '' ? '' : Number(e.target.value))} step="any" placeholder="a (m)" className={`form-input ${highlightEdit ? 'highlight-animation' : ''}`} />
                <input type="number" value={lVal} onChange={e => setLVal(e.target.value === '' ? '' : Number(e.target.value))} step="any" placeholder="L (m)" className={`form-input ${highlightEdit ? 'highlight-animation' : ''}`} />
                <input type="number" value={rVal} onChange={e => setRVal(e.target.value === '' ? '' : Number(e.target.value))} step="any" placeholder="R (Ω)" className={`form-input ${highlightEdit ? 'highlight-animation' : ''}`} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {editId === null ? (
                  <button className="btn btn-primary w-full sm:w-auto" onClick={handleAddMeasurement}>Agregar medición</button>
                ) : (
                  <>
                    <button className="btn btn-primary w-full sm:w-auto" onClick={handleUpdateMeasurement}>Actualizar</button>
                    <button className="btn btn-accent w-full sm:w-auto" onClick={cancelEdit}>Cancelar</button>
                  </>
                )}
              </div>
              <div className="formula text-sm text-center" dangerouslySetInnerHTML={{ __html: 'ρsch = π · R · n · a · (n + 1)<br />con n = (L − a/2) / a' }} />
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Gráfico SEV (Log-Log)</h2>
            <div className="relative mx-auto w-full max-w-4xl h-[600px]">
              <canvas ref={chartContainer}></canvas>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Tabla de Resultados</h2>
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

        {/* Columna Derecha Principal (Gráfico y Acciones) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Anexo de Imágenes</h2>
            <div className="space-y-4">
              {/* --- Vista para Móviles: Botones explícitos --- */}
              <div className="flex flex-col sm:hidden gap-4">
                  <label htmlFor="camera-upload-sev" className="btn btn-secondary flex-1 cursor-pointer flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l1.416-2.356A2 2 0 0111 3h2a2 2 0 011.664.89l1.416 2.356A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Tomar Foto
                  </label>
                  <input id="camera-upload-sev" type="file" className="hidden" multiple accept="image/*" capture="environment" onChange={e => handleImageChange(e.target.files)} />
                  <label htmlFor="gallery-upload-sev" className="btn btn-outline flex-1 cursor-pointer flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Elegir de Galería
                  </label>
                  <input id="gallery-upload-sev" ref={uploadImagesRef} type="file" className="hidden" multiple accept="image/*" onChange={e => handleImageChange(e.target.files)} />
              </div>

              {/* --- Vista para Escritorio: Arrastrar y Soltar --- */}
              <label htmlFor="file-upload-sev-desktop" className={`hidden sm:flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Haz clic para cargar</span> o arrastra y suelta</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
                  </div>
                  <input id="file-upload-sev-desktop" ref={uploadImagesRef} type="file" className="hidden" multiple accept="image/*" onChange={e => handleImageChange(e.target.files)} />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
                  {annexImages.map((image, index) => (
                      <div key={index} className="card overflow-hidden p-0">
                          <div className="relative w-full group" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
                              <Image src={image.dataUrl} alt={`Preview ${index}`} layout="fill" objectFit="cover" />
                              <div className="absolute top-1 right-1">
                                  <button className="btn btn-sm bg-red-500 hover:bg-red-600 cursor-pointer h-7 w-7 opacity-70 group-hover:opacity-100 flex items-center justify-center" onClick={() => deleteAnnexImage(index)}>
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
                                              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 mt-2 border-t dark:border-gray-700">
                                                  <button className="btn btn-secondary btn-sm" onClick={() => handleEnterEditMode(index, image.desc)}>Editar</button>                                                  
                                              </div>
                                          </div>
                                      ) : (
                                          <button className="btn btn-secondary w-full mt-auto cursor-pointer" onClick={() => handleEnterEditMode(index, image.desc)}>Agregar descripción</button>
                                      )}
                                  </div>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
               <button type="button" className="btn btn-primary hover:bg-red-600 w-full sm:w-auto" onClick={clearImages}>Borrar todas las fotos</button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Acciones</h2>
            <div className="flex flex-col space-y-3">
              <button type="button" className="btn btn-primary w-full justify-center" onClick={handleGenerateReport}>Generar Informe (PDF)</button>
              <button type="button" className="btn btn-accent w-full justify-center" onClick={handleClearAll}>Limpiar Todo</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}