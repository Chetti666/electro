'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';

// --- Interfaces --- 
interface ImageEvidence {
  src: string;
  description: string;
}

interface InspectionPoint {
  id: string;
  title: string;
  status: 'Bueno' | 'Regular' | 'Malo' | 'N/A';
  observation: string;
  images: ImageEvidence[];
}

interface ReportData {
  clientName: string;
  clientAddress: string;
  inspectorName: string;
  inspectionDate: string;
  inspectionReason: string; // Added
  summaryNotes: string;
  points: InspectionPoint[];
}

// --- Datos por Defecto --- 
const defaultInspectionPoints: Omit<InspectionPoint, 'status' | 'observation' | 'images'>[] = [
    { id: 'empalme', title: 'Empalme' },
    { id: 'tablero-general', title: 'Tableros y Protecciones' },
    { id: 'puesta-tierra', title: 'Sistema de Puesta a Tierra' },
    { id: 'alimentadores', title: 'Alimentadores y Subalimentadores' },
    { id: 'cableado', title: 'Cableado electrico y Conexiones' },
    { id: 'canalizacion', title: 'Sistemas de Canalización' },
    { id: 'enchufes', title: 'Enchufes e Interruptores' },
    { id: 'iluminacion', title: 'Puntos de Iluminación' },
];

// --- Componente Principal --- 
const InformeInspeccionPage: React.FC = () => {
    // --- Estados --- 
    const [inspectionData, setInspectionData] = useState<Omit<ReportData, 'points' | 'inspectionReason'> & { inspectionReason: string }>({
        clientName: '',
        clientAddress: '',
        inspectorName: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectionReason: '', // Added
        summaryNotes: '',
    });
    const [inspectionPoints, setInspectionPoints] = useState<InspectionPoint[]>(
        defaultInspectionPoints.map(p => ({ ...p, status: 'N/A', observation: '', images: [] }))
    );
    const [customItemName, setCustomItemName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- Manejadores de Cambios --- 
    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setInspectionData(prev => ({ ...prev, [id]: value }));
    };

    const handlePointChange = (id: string, field: keyof InspectionPoint, value: any) => {
        setInspectionPoints(prev =>
            prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
        );
    };

    const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = event => {
                    const newImage: ImageEvidence = {
                        src: event.target?.result as string,
                        description: '',
                    };
                    setInspectionPoints(prev =>
                        prev.map(p =>
                            p.id === id ? { ...p, images: [...p.images, newImage] } : p
                        )
                    );
                };
                reader.readAsDataURL(file);
            });
            e.target.value = ''; // Reset input
        }
    };

    const handleImageDescriptionChange = (pointId: string, imageIndex: number, description: string) => {
        setInspectionPoints(prev =>
            prev.map(p =>
                p.id === pointId
                    ? { ...p, images: p.images.map((img, idx) => idx === imageIndex ? { ...img, description } : img) }
                    : p
            )
        );
    };

    const deleteImage = (pointId: string, imageIndex: number) => {
        setInspectionPoints(prev =>
            prev.map(p =>
                p.id === pointId
                    ? { ...p, images: p.images.filter((_, idx) => idx !== imageIndex) }
                    : p
            )
        );
    };

    const addCustomItem = () => {
        if (customItemName.trim()) {
            const newPoint: InspectionPoint = {
                id: 'custom-' + Date.now(),
                title: customItemName.trim(),
                status: 'N/A',
                observation: '',
                images: [],
            };
            setInspectionPoints(prev => [...prev, newPoint]);
            setCustomItemName('');
        }
    };

    // --- Generación de PDF --- 
    const generatePdf = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const reportData: ReportData = {
        ...inspectionData,
        points: inspectionPoints.filter(p => p.status !== 'N/A'),
      };

      const findings = {
        malo: reportData.points.filter(p => p.status === 'Malo'),
        regular: reportData.points.filter(p => p.status === 'Regular'),
        bueno: reportData.points.filter(p => p.status === 'Bueno'),
      };

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let yPosition = 0;
      let sectionCounter = 1;

      const newPageIfNeeded = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin + 10;
        }
      };

      const printLeftAlignedText = (text: string, x: number, y: number, maxWidth: number) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * 5;
      };

      const drawCoverPage = () => {
        doc.setDrawColor(0, 86, 179);
        doc.setLineWidth(1.5);
        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('Informe de Inspección Eléctrica', margin, 60);

        const boxY = 130, boxHeight = 60;
        doc.setLineWidth(0.5); doc.rect(margin, boxY, pageWidth - (margin * 2), boxHeight);
        let textY = boxY + 15;
        doc.setFontSize(12);
        const details = [
          { label: 'Cliente:', value: reportData.clientName },
          { label: 'Dirección:', value: reportData.clientAddress },
          { label: 'Inspector:', value: reportData.inspectorName },
          { label: 'Fecha:', value: reportData.inspectionDate }
        ];
        details.forEach(detail => {
          doc.setFont('helvetica', 'bold'); doc.text(detail.label, margin + 10, textY);
          doc.setFont('helvetica', 'normal'); doc.text(detail.value, margin + 40, textY);
          textY += 10;
        });

        textY += 10;
        doc.setFont('helvetica', 'bold'); doc.text('Resumen de Hallazgos:', margin + 10, textY);
        textY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFillColor(220, 53, 69); doc.circle(margin + 15, textY - 2, 3, 'F');
        doc.text(`${findings.malo.length} Punto(s) Crítico(s) / Malo`, margin + 20, textY);
        textY += 10;
        doc.setFillColor(255, 193, 7); doc.circle(margin + 15, textY - 2, 3, 'F');
        doc.text(`${findings.regular.length} Punto(s) con Observaciones / Regular`, margin + 20, textY);
        textY += 10;
        doc.setFillColor(40, 167, 69); doc.circle(margin + 15, textY - 2, 3, 'F');
        doc.text(`${findings.bueno.length} Punto(s) en Buen Estado`, margin + 20, textY);
      };

      const drawFindings = () => {
        const drawPoint = (point: InspectionPoint) => {
          const statusColors: { [key: string]: number[] } = { Malo: [220, 53, 69], Regular: [255, 193, 7], Bueno: [40, 167, 69] };
          const color = statusColors[point.status];

          newPageIfNeeded(25);
          doc.setFillColor(color[0], color[1], color[2]);
          doc.rect(margin, yPosition, contentWidth, 10, 'F');
          doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(255);
          doc.text(`${point.status.toUpperCase()}: ${point.title}`, margin + 3, yPosition + 7);
          yPosition += 15;
          doc.setTextColor(0);

          if (point.observation) {
            newPageIfNeeded(20);
            doc.setFontSize(10); doc.setFont('helvetica', 'bold');
            doc.text('Observación General:', margin, yPosition);
            yPosition += 5;
            doc.setFont('helvetica', 'normal');
            yPosition += printLeftAlignedText(point.observation, margin, yPosition, contentWidth) + 5;
          }

          if (point.images.length > 0) {
            newPageIfNeeded(15);
            doc.setFont('helvetica', 'bold'); doc.text('Evidencia Fotográfica:', margin, yPosition); yPosition += 5;

            point.images.forEach((image, index) => {
              const imgWidth = 80;
              const imgProps = doc.getImageProperties(image.src);
              const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
              doc.setFontSize(9);
              const descLines = image.description ? doc.splitTextToSize(image.description, contentWidth - imgWidth - 5) : [''];
              const descHeight = (descLines.length * doc.getLineHeight()) / doc.internal.scaleFactor;
              const blockHeight = Math.max(imgHeight, descHeight) + 10;
              
              newPageIfNeeded(blockHeight);

              doc.addImage(image.src, 'JPEG', margin, yPosition, imgWidth, imgHeight);
              if (image.description) {
                  doc.setTextColor(80);
                  doc.text(descLines, margin + imgWidth + 5, yPosition);
                  doc.setTextColor(0);
              }

              doc.setFont('helvetica', 'normal'); doc.setTextColor(0);
              yPosition += blockHeight;
            });
          }
          yPosition += 5;
          doc.setDrawColor(220); doc.setLineWidth(0.2);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10;
        };

        newPageIfNeeded(20);
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, yPosition, contentWidth, 10, 'F');
        doc.setFontSize(16); doc.setFont('helvetica', 'bold');
        doc.text(`${sectionCounter++}. Detalle de Puntos de Inspección`, margin + 2, yPosition + 7);
        yPosition += 15;

        findings.malo.forEach(drawPoint);
        findings.regular.forEach(drawPoint);
        findings.bueno.forEach(drawPoint);
      };

      // --- PDF Generation Flow ---
      drawCoverPage();

      const contentExists = reportData.points.length > 0 || reportData.summaryNotes || reportData.inspectionReason;
      if (contentExists) {
        doc.addPage();
        yPosition = margin + 10;
      }

      if (reportData.inspectionReason) {
        newPageIfNeeded(25);
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, yPosition, contentWidth, 10, 'F');
        doc.setFontSize(16); doc.setFont('helvetica', 'bold');
        doc.text(`${sectionCounter++}. Motivo de la Inspección`, margin + 2, yPosition + 7);
        yPosition += 15;
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        yPosition += printLeftAlignedText(reportData.inspectionReason, margin, yPosition, contentWidth) + 10;
      }

      if (reportData.points.length > 0) {
        drawFindings();
      }

      if (reportData.summaryNotes) {
        const requiredHeight = doc.splitTextToSize(reportData.summaryNotes, contentWidth).length * 5 + 20;
        newPageIfNeeded(requiredHeight);
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, yPosition, contentWidth, 10, 'F');
        doc.setFontSize(16); doc.setFont('helvetica', 'bold');
        doc.text(`${sectionCounter++}. Resumen y Conclusiones`, margin + 2, yPosition + 7);
        yPosition += 15;
        doc.setFontSize(10); doc.setFont('helvetica', 'normal');
        printLeftAlignedText(reportData.summaryNotes, margin, yPosition, contentWidth);
      }

      const totalPages = (doc.internal as any).getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9); doc.setTextColor(150);
        doc.text(`Informe de Inspección para: ${reportData.clientName}`, margin, 10);
        doc.line(margin, 12, pageWidth - margin, 12);
        const footerText = `Página ${i} de ${totalPages}`;
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });
        doc.setTextColor(0);
      }

      doc.save(`Informe_Inspeccion_${reportData.clientName.replace(/ /g, '_')}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Ocurrió un error al generar el PDF. Revise la consola.");
    } finally {
      setIsLoading(false);
    }
    };

    // --- Renderizado --- 
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Generador de Informe de Inspección</h1>

            <div className="card">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">1. Datos de la Inspección</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                    <div>
                        <label htmlFor="clientName" className="form-label">Nombre del Cliente:</label>
                        <input type="text" id="clientName" className="form-input" value={inspectionData.clientName} onChange={handleDataChange} />
                    </div>
                    <div>
                        <label htmlFor="clientAddress" className="form-label">Dirección:</label>
                        <input type="text" id="clientAddress" className="form-input" value={inspectionData.clientAddress} onChange={handleDataChange} />
                    </div>
                    <div>
                        <label htmlFor="inspectorName" className="form-label">Inspector:</label>
                        <input type="text" id="inspectorName" className="form-input" value={inspectionData.inspectorName} onChange={handleDataChange} />
                    </div>
                    <div>
                        <label htmlFor="inspectionDate" className="form-label">Fecha:</label>
                        <input type="date" id="inspectionDate" className="form-input" value={inspectionData.inspectionDate} onChange={handleDataChange} />
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="inspectionReason" className="form-label">Motivo de la Inspección:</label>
                    <textarea
                        id="inspectionReason"
                        rows={3}
                        className="form-input mt-1"
                        placeholder="Ej: Verificación para trámite TE1, auditoría interna, etc."
                        value={inspectionData.inspectionReason}
                        onChange={handleDataChange}
                    />
                </div>

                <h2 className="text-xl font-semibold my-6 text-gray-900 dark:text-white">2. Checklist de Inspección</h2>
                <div className="space-y-4">
                    {inspectionPoints.map(p => (
                        <div key={p.id} className="border rounded-lg dark:border-gray-700 overflow-hidden">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="font-semibold text-lg">{p.title}</h3>
                            </div>
                            <div className="p-4 border-t dark:border-gray-700 space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    {(['Bueno', 'Regular', 'Malo', 'N/A'] as const).map(status => (
                                        <React.Fragment key={status}>
                                            <input
                                                type="radio"
                                                id={`status-${status.toLowerCase()}-${p.id}`}
                                                name={`status-${p.id}`}
                                                value={status}
                                                checked={p.status === status}
                                                onChange={() => handlePointChange(p.id, 'status', status)}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor={`status-${status.toLowerCase()}-${p.id}`}
                                                className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${ 
                                                    p.status === status ? 
                                                    (status === 'Bueno' ? 'bg-green-500 text-white' : 
                                                    status === 'Regular' ? 'bg-yellow-400 text-gray-800' : 
                                                    status === 'Malo' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200') : 
                                                    'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                                }`}>
                                                {status}
                                            </label>
                                        </React.Fragment>
                                    ))}
                                </div>
                                
                                <div>
                                    <label className="form-label text-sm">Observación General del Punto:</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Ej: Cumple con la norma, se recomienda revisión en 1 año..."
                                        className="form-input mt-1"
                                        value={p.observation}
                                        onChange={e => handlePointChange(p.id, 'observation', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="form-label text-sm">Evidencia Fotográfica:</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="form-input mt-1"
                                        onChange={e => handleImageUpload(p.id, e)}
                                    />
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                        {p.images.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img src={img.src} alt={`Evidencia ${idx + 1}`} className="w-full h-24 object-cover rounded-md" />
                                                <button onClick={() => deleteImage(p.id, idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                                <textarea
                                                    placeholder="Desc..."
                                                    rows={2}
                                                    className="form-input text-xs mt-1"
                                                    value={img.description}
                                                    onChange={e => handleImageDescriptionChange(p.id, idx, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 className="text-xl font-semibold my-6 text-gray-900 dark:text-white">3. Añadir Otro Punto</h2>
                 <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed rounded-lg">
                    <input
                        type="text"
                        placeholder="Nombre del nuevo punto de inspección..."
                        className="form-input flex-grow"
                        value={customItemName}
                        onChange={e => setCustomItemName(e.target.value)}
                    />
                    <button onClick={addCustomItem} className="btn btn-secondary w-full sm:w-auto">Agregar Punto</button>
                </div>

                <h2 className="text-xl font-semibold my-6 text-gray-900 dark:text-white">4. Resumen y Conclusiones</h2>
                <div>
                    <label htmlFor="summaryNotes" className="form-label">Observaciones generales y próximos pasos:</label>
                    <textarea
                        id="summaryNotes"
                        rows={5}
                        className="form-input mt-1"
                        value={inspectionData.summaryNotes}
                        onChange={handleDataChange}
                    />
                </div>

                <div className="mt-8">
                    {isLoading ? (
                        <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">Generando PDF, por favor espere...</div>
                    ) : (
                        <button onClick={generatePdf} className="btn btn-primary w-full font-bold">
                            Generar Informe PDF
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InformeInspeccionPage;
