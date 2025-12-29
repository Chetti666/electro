'use client';

import React, { useState, useEffect, DragEvent } from 'react';
import imageCompression from 'browser-image-compression';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import Link from 'next/link';
import NextImage from 'next/image';

// --- Interfaces --- 
interface ImageEvidence {
    src: string;
    description: string;
}

interface EditingImage {
    pointId: string;
    imageIndex: number;
}

interface InspectionPoint {
    id: string;
    title: string;
    status: 'Bueno' | 'Regular' | 'Malo' | '';
    observation: string;
    images: ImageEvidence[];
    isOpen: boolean;
}

interface ReportData {
    clientName: string;
    clientAddress: string;
    inspectorName: string;
    inspectionDate: string;
    inspectionReason: string;
    summaryNotes: string;
    reference: string;
    points: InspectionPoint[];
}

// --- Datos por Defecto --- 
const defaultInspectionPoints: Omit<InspectionPoint, 'status' | 'observation' | 'images' | 'isOpen'>[] = [
    { id: 'empalme', title: 'Empalme y Medidor' },
    { id: 'tablero-general', title: 'Tableros, Protecciones y Selectividad' },
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
    const [reportDetails, setReportDetails] = useState({
        clientName: '',
        clientAddress: '',
        inspectorName: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectionReason: '',
        summaryNotes: '',
        reference: '',
    });
    const [inspectionPoints, setInspectionPoints] = useState<InspectionPoint[]>(
        defaultInspectionPoints.map(p => ({ ...p, status: '', observation: '', images: [], isOpen: false }))
    );
    const [customItemName, setCustomItemName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editingImage, setEditingImage] = useState<EditingImage | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [tempDescription, setTempDescription] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [hasImagesError, setHasImagesError] = useState(false);
    const [hasStatusError, setHasStatusError] = useState(false);
    const [formErrors, setFormErrors] = useState({
        clientName: false,
        clientAddress: false,
        inspectorName: false,
        inspectionDate: false
    });

    useEffect(() => {
        setReportDetails(prev => ({
            ...prev,
            inspectionDate: new Date().toISOString().split('T')[0]
        }));
    }, []);

    // --- Manejadores de Cambios --- 
    const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setReportDetails(prev => ({ ...prev, [id]: value }));
    };

    const handlePointChange = (id: string, field: keyof InspectionPoint, value: InspectionPoint[keyof InspectionPoint]) => {
        setInspectionPoints(prev =>
            prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
        );
    };

    const handleImageUpload = async (pointId: string, files: FileList | null): Promise<void> => {
        if (!files) return;

        const imageProcessingOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
            // La librería corrige la orientación por defecto al leer los metadatos EXIF.
        };

        const filePromises = Array.from(files).map(async (file) => {
            try {
                const compressedFile = await imageCompression(file, imageProcessingOptions);
                const imageSrc = await imageCompression.getDataUrlFromFile(compressedFile);
                return { src: imageSrc, description: '' };
            } catch (error) {
                console.error("Error al procesar la imagen:", error);
                // Fallback: si la compresión falla, leer el archivo original.
                return new Promise<ImageEvidence | null>(resolve => {
                    const reader = new FileReader();
                    reader.onload = event => resolve(event.target && typeof event.target.result === 'string' ? { src: event.target.result, description: '' } : null);
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                });
            }
        });

        const newImages = await Promise.all(filePromises);
        const validImages = newImages.filter((img): img is ImageEvidence => img !== null);
        setInspectionPoints(prev => prev.map(p => p.id === pointId ? { ...p, images: [...p.images, ...validImages] } : p));
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

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, pointId: string) => {
        handleImageUpload(pointId, e.target.files);
        // Reset the input value to allow re-selecting the same file
        e.target.value = '';
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
                status: '',
                observation: '',
                images: [],
                isOpen: true,
            };
            setInspectionPoints(prev => [...prev, newPoint]);
            setCustomItemName('');
        }
    };

    // --- Handlers para Edición de Descripción ---
    const togglePoint = (id: string) => {
        setInspectionPoints(prev =>
            prev.map(p => (p.id === id ? { ...p, isOpen: !p.isOpen } : p))
        );
    };

    const handleEnterEditMode = (pointId: string, imageIndex: number, currentDescription: string) => {
        setEditingImage({ pointId, imageIndex });
        setTempDescription(currentDescription);
    };

    const handleSaveDescription = () => {
        if (editingImage) {
            handleImageDescriptionChange(editingImage.pointId, editingImage.imageIndex, tempDescription);
            setEditingImage(null);
            setTempDescription('');
        }
    };

    const handleCancelEdit = () => {
        setEditingImage(null);
        setTempDescription('');
    };

    const handleDeleteDescription = (pointId: string, imageIndex: number) => {
        handleImageDescriptionChange(pointId, imageIndex, '');
    };

    const validateAndGenerate = () => {
        const newErrors = {
            clientName: !reportDetails.clientName.trim(),
            clientAddress: !reportDetails.clientAddress.trim(),
            inspectorName: !reportDetails.inspectorName.trim(),
            inspectionDate: !reportDetails.inspectionDate.trim(),
        };

        const hasEmptyFields = Object.values(newErrors).some(Boolean);
        const hasNoImages = !inspectionPoints.some(p => p.images.length > 0);
        const hasNoStatus = !inspectionPoints.some(p => p.status !== '');

        if (hasEmptyFields || hasNoImages || hasNoStatus) {
            setFormErrors(newErrors);
            setHasImagesError(hasNoImages);
            setHasStatusError(hasNoStatus);
            setShowErrorModal(true);
        } else {
            setFormErrors({
                clientName: false,
                clientAddress: false,
                inspectorName: false,
                inspectionDate: false
            });
            setHasImagesError(false);
            setHasStatusError(false);
            generatePdf();
        }
    };

    const handleCloseModal = () => {
        setShowErrorModal(false);
        setTimeout(() => {
            const errorOrder = ['clientName', 'clientAddress', 'inspectorName', 'inspectionDate'];
            const firstErrorKey = errorOrder.find(key => formErrors[key as keyof typeof formErrors]);
            
            if (firstErrorKey) {
                const element = document.getElementById(firstErrorKey);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                }
            } else if (hasImagesError || hasStatusError) {
                const element = document.getElementById('checklist-title');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 100);
    };

    // --- Drag and Drop Handlers ---
    const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLLabelElement>, pointId: string) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleImageUpload(pointId, files);
        }
    };


    // --- Generación de PDF --- 
    const generatePdf = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const doc = new jsPDF('p', 'mm', [210, 279]);
            const reportData: ReportData = {
                ...reportDetails,
                points: inspectionPoints.filter(p => p.status !== ''),
            };

            const findings = {
                malo: reportData.points.filter(p => p.status === 'Malo'),
                regular: reportData.points.filter(p => p.status === 'Regular'),
                bueno: reportData.points.filter(p => p.status === 'Bueno'),
            };

            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            const contentWidth = pageWidth - margin * 2;
            let yPosition = margin;
            let sectionCounter = 1;

            const newPageIfNeeded = (requiredHeight: number) => {
                if (yPosition + requiredHeight > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin + 1;
                }
            };

            const drawCoverPage = () => {
                doc.setDrawColor(0, 86, 179); doc.setLineWidth(1.5);
                doc.rect(15, 15 - 6, contentWidth + (margin - 15) * 2, pageHeight - (15 - 6) - 15);
                doc.setFont('helvetica', 'bold'); doc.setFontSize(24);
                doc.text('Informe de Inspección Eléctrica', pageWidth / 2, 60, { align: 'center' });
                doc.setFontSize(18); doc.text(reportData.reference, pageWidth / 2, 72, { align: 'center' });

                const details = [
                    [{ content: 'Cliente:', styles: { fontStyle: 'bold' as const } }, reportData.clientName],
                    [{ content: 'Dirección:', styles: { fontStyle: 'bold' as const } }, reportData.clientAddress],
                    [{ content: 'Referencia:', styles: { fontStyle: 'bold' as const } }, reportData.reference],
                    [{ content: 'Inspector:', styles: { fontStyle: 'bold' as const } }, reportData.inspectorName],
                    [{ content: 'Fecha de Inspección:', styles: { fontStyle: 'bold' as const } }, reportData.inspectionDate ? new Date(reportData.inspectionDate + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "No especificada"],
                ];

                autoTable(doc, {
                    startY: 120,
                    body: details,
                    theme: 'plain',
                    styles: { fontSize: 12, cellPadding: 2 },
                    columnStyles: { 0: { cellWidth: 50 } },
                    margin: { left: margin, right: margin }
                });

                let summaryY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
                doc.setFont('helvetica', 'bold'); doc.text('Resumen de Hallazgos:', margin, summaryY);
                summaryY += 10;
                doc.setFont('helvetica', 'normal');

                doc.setFillColor(220, 53, 69); doc.circle(margin + 5, summaryY - 2, 3, 'F');
                doc.text(`${findings.malo.length} Punto(s) Crítico(s) / Malo`, margin + 10, summaryY);
                summaryY += 10;

                doc.setFillColor(255, 193, 7); doc.circle(margin + 5, summaryY - 2, 3, 'F');
                doc.text(`${findings.regular.length} Punto(s) con Observaciones / Regular`, margin + 10, summaryY);
                summaryY += 10;

                doc.setFillColor(40, 167, 69); doc.circle(margin + 5, summaryY - 2, 3, 'F');
                doc.text(`${findings.bueno.length} Punto(s) en Buen Estado`, margin + 10, summaryY);
            };

            // --- PDF Generation Flow ---
            drawCoverPage();

            const contentExists = reportData.points.length > 0 || reportData.summaryNotes || reportData.inspectionReason;

            const applyTitleStyle = () => {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setDrawColor(0, 86, 179); // Azul para el subrayado
            };

            if (contentExists) {
                doc.addPage();
                yPosition = margin;
            }

            if (reportData.inspectionReason) {
                newPageIfNeeded(25);
                applyTitleStyle();
                const title = `${sectionCounter++}. Motivo de la Inspección`;
                doc.text(title, margin, yPosition);
                const textWidth = doc.getStringUnitWidth(title) * doc.getFontSize() / doc.internal.scaleFactor;
                doc.setLineWidth(0.3);
                doc.line(margin, yPosition + 1, margin + textWidth, yPosition + 1);
                yPosition += 15;

                doc.setFontSize(10); doc.setFont('helvetica', 'normal');
                const reasonLines = doc.splitTextToSize(reportData.inspectionReason, contentWidth);
                doc.text(reasonLines, margin, yPosition);
                yPosition += reasonLines.length * 5 + 10;
            }

            if (reportData.points.length > 0) {
                const mainSectionNumber = sectionCounter;
                let subSectionIndex = 1;

                const drawPoint = (point: InspectionPoint) => {
                    const statusColors: { [key: string]: number[] } = { Malo: [220, 53, 69], Regular: [255, 193, 7], Bueno: [40, 167, 69] };
                    const color = statusColors[point.status];

                    let requiredHeight = 15; // Altura del título
                    if (point.observation) requiredHeight += 15;
                    if (point.images.length > 0) requiredHeight += 60; // Estimación para una fila de imágenes
                    newPageIfNeeded(requiredHeight);

                    // --- Título del Punto ---
                    applyTitleStyle();
                    const titleText = `${mainSectionNumber}.${subSectionIndex++} ${point.title}`;
                    const statusText = point.status;
                    doc.text(titleText, margin, yPosition);
                    const titleWidth = doc.getStringUnitWidth(titleText) * doc.getFontSize() / doc.internal.scaleFactor;
                    doc.setLineWidth(0.3);
                    doc.line(margin, yPosition + 1, margin + titleWidth, yPosition + 1);

                    // --- Estado con círculo ---
                    const statusX = margin + titleWidth + 5;
                    doc.setFillColor(color[0], color[1], color[2]);
                    doc.circle(statusX, yPosition - 1, 2, 'F');
                    doc.setFont('helvetica', 'normal'); doc.setTextColor(80);
                    doc.text(`(${statusText})`, statusX + 4, yPosition);

                    yPosition += 10;
                    doc.setTextColor(0);

                    // --- Observación ---
                    if (point.observation) {
                        const obsLines = doc.splitTextToSize(point.observation, contentWidth - 10);
                        newPageIfNeeded(obsLines.length * 5 + 10);
                        doc.setFontSize(10); doc.setFont('helvetica', 'bold');
                        doc.text('Observación:', margin, yPosition);
                        yPosition += 5;
                        doc.setFont('helvetica', 'normal'); doc.setTextColor(80);
                        doc.text(obsLines, margin, yPosition);
                        yPosition += obsLines.length * 5 + 8;
                        doc.setTextColor(0);
                    }

                    // --- Evidencia Fotográfica ---
                    if (point.images.length > 0) {
                        const horizontalImages: (ImageEvidence & { props: { width: number; height: number; } })[] = [];
                        const verticalImages: (ImageEvidence & { props: { width: number; height: number; } })[] = [];
                        let globalImageCounter = 0;

                        point.images.forEach(image => {
                            if (image.src && typeof image.src === 'string') {
                                try {
                                    const imgProps = doc.getImageProperties(image.src);
                                    if (imgProps.width >= imgProps.height) {
                                        horizontalImages.push({ ...image, props: imgProps });
                                    } else {
                                        verticalImages.push({ ...image, props: imgProps });
                                    }
                                } catch (e) {
                                    console.error(`Error getting image properties:`, e);
                                }
                            }
                        });

                        const drawImageWithDescription = (image: ImageEvidence, x: number, y: number, width: number, height: number, figure: number) => {
                            doc.addImage(image.src, 'JPEG', x, y, width, height);
                            doc.setFontSize(10); doc.setTextColor(80);
                            const figureLabel = `Figura ${figure}`;
                            doc.setFont('helvetica', 'bold');
                            doc.text(figureLabel, x, y + height + 5);

                            const figureLabelWidth = doc.getStringUnitWidth(figureLabel) * doc.getFontSize() / doc.internal.scaleFactor;
                            doc.setFont('helvetica', 'normal');
                            const descriptionText = image.description ? `: ${image.description}` : '';
                            doc.text(descriptionText, x + figureLabelWidth, y + height + 5, { maxWidth: width - figureLabelWidth });
                        };

                        if (horizontalImages.length > 0 || verticalImages.length > 0) {
                            newPageIfNeeded(15);
                            doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
                            doc.text('Evidencia Fotográfica:', margin, yPosition); yPosition += 8;
                        }

                        // Renderizar imágenes horizontales (2 por fila)
                        if (horizontalImages.length > 0) {
                            const imgWidth = (contentWidth - 10) / 2;
                            for (let i = 0; i < horizontalImages.length; i += 2) {
                                const img1 = horizontalImages[i];
                                const img2 = horizontalImages[i + 1];

                                const img1Height = (img1.props.height * imgWidth) / img1.props.width;
                                const img1BlockHeight = img1Height + (img1.description ? 13 : 5);

                                let rowHeight = img1BlockHeight;

                                if (img2) {
                                    const img2Height = (img2.props.height * imgWidth) / img2.props.width;
                                    const img2BlockHeight = img2Height + (img2.description ? 13 : 5);
                                    rowHeight = Math.max(img1BlockHeight, img2BlockHeight);
                                }

                                newPageIfNeeded(rowHeight + 5);

                                drawImageWithDescription(img1, margin, yPosition, imgWidth, img1Height, ++globalImageCounter);

                                if (img2) {
                                    const img2Height = (img2.props.height * imgWidth) / img2.props.width;
                                    drawImageWithDescription(img2, margin + imgWidth + 10, yPosition, imgWidth, img2Height, ++globalImageCounter);
                                }

                                yPosition += rowHeight + 10;
                                if (i + 2 < horizontalImages.length || verticalImages.length > 0) {
                                    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
                                    doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
                                }
                            }
                        }

                        // Renderizar imágenes verticales (3 por fila)
                        if (verticalImages.length > 0) {
                            const imgWidth = (contentWidth - 20) / 3;
                            for (let i = 0; i < verticalImages.length; i += 3) {
                                const imagesInRow = verticalImages.slice(i, i + 3);
                                let rowHeight = 0;

                                imagesInRow.forEach(img => {
                                    const imgHeight = (img.props.height * imgWidth) / img.props.width;
                                    const blockHeight = imgHeight + (img.description ? 13 : 5);
                                    rowHeight = Math.max(rowHeight, blockHeight);
                                });

                                newPageIfNeeded(rowHeight + 5);

                                imagesInRow.forEach((img, index) => {
                                    const xPos = margin + index * (imgWidth + 10);
                                    const imgHeight = (img.props.height * imgWidth) / img.props.width;
                                    drawImageWithDescription(img, xPos, yPosition, imgWidth, imgHeight, ++globalImageCounter);
                                });

                                yPosition += rowHeight + 10;
                                if (i + 3 < verticalImages.length) {
                                    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
                                    doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
                                }
                            }
                        }
                    }
                    yPosition += 10; // Espacio extra después de cada punto de inspección
                };

                newPageIfNeeded(20);
                applyTitleStyle();
                const title = `${sectionCounter++}. Detalle de Puntos de Inspección`;
                doc.text(title, margin, yPosition);
                const textWidth = doc.getStringUnitWidth(title) * doc.getFontSize() / doc.internal.scaleFactor;
                doc.setLineWidth(0.3);
                doc.line(margin, yPosition + 1, margin + textWidth, yPosition + 1);
                yPosition += 10;

                [...findings.malo, ...findings.regular, ...findings.bueno].forEach(drawPoint);
            }

            if (reportData.summaryNotes) {
                const requiredHeight = doc.splitTextToSize(reportData.summaryNotes, contentWidth).length * 5 + 20;
                newPageIfNeeded(requiredHeight);
                applyTitleStyle();
                const title = `${sectionCounter++}. Conclusiones y Recomendaciones`;
                doc.text(title, margin, yPosition);
                const textWidth = doc.getStringUnitWidth(title) * doc.getFontSize() / doc.internal.scaleFactor;
                doc.setLineWidth(0.3);
                doc.line(margin, yPosition + 1, margin + textWidth, yPosition + 1);
                yPosition += 15;
                doc.setFontSize(10); doc.setFont('helvetica', 'normal');
                const summaryLines = doc.splitTextToSize(reportData.summaryNotes, contentWidth);
                doc.text(summaryLines, margin, yPosition);
            }

            const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
            for (let i = 2; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(9); doc.setTextColor(150);
                doc.text(`Informe de Inspección - ${reportData.clientName}`, 15, 15 - 8);
                doc.line(15, 15 - 6, contentWidth + 15, 15 - 6);
                const footerText = `Página ${i} de ${totalPages}`;
                doc.line(15, pageHeight - 15, contentWidth + 15, pageHeight - 15);
                doc.text(footerText, pageWidth / 2, pageHeight - 15 + 4, { align: 'center' });
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
        <div className="container mx-auto px-4 pt-24 pb-12 md:pt-32">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Generador de Informe de Inspección</h1>
                <p className="text-gray-600 dark:text-gray-400">Crea informes de inspección eléctrica detallados y profesionales.</p>
                <br />
                <Link href="/informes" className="text-amber-500 hover:text-amber-600 inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Volver a informes
                </Link>
            </div>

            <div className="card">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">1. Datos de la Inspección</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                    <div>
                        <label htmlFor="clientName" className="form-label">Nombre del Cliente</label>
                        <input id="clientName" className={`form-input ${formErrors.clientName ? 'border-red-500 ring-1 ring-red-500' : ''}`} value={reportDetails.clientName} onChange={handleDataChange} placeholder="Ej: Constructora XYZ" />
                    </div>
                    <div>
                        <label htmlFor="clientAddress" className="form-label">Dirección del Proyecto</label>
                        <input id="clientAddress" className={`form-input ${formErrors.clientAddress ? 'border-red-500 ring-1 ring-red-500' : ''}`} value={reportDetails.clientAddress} onChange={handleDataChange} placeholder="Ej: Av. Siempreviva 742, Springfield" />
                    </div>
                    <div>
                        <label htmlFor="reference" className="form-label">Referencia</label>
                        <input id="reference" className="form-input" value={reportDetails.reference} onChange={handleDataChange} placeholder="Ej: Revisión Local Comercial" />
                    </div>
                    <div>
                        <label htmlFor="inspectorName" className="form-label">Inspector a Cargo</label>
                        <input id="inspectorName" className={`form-input ${formErrors.inspectorName ? 'border-red-500 ring-1 ring-red-500' : ''}`} value={reportDetails.inspectorName} onChange={handleDataChange} placeholder="Ej: Juan Pérez (Licencia SEC)" />
                    </div>
                    <div>
                        <label htmlFor="inspectionDate" className="form-label">Fecha de Inspección</label>
                        <input type="date" id="inspectionDate" className={`form-input ${formErrors.inspectionDate ? 'border-red-500 ring-1 ring-red-500' : ''}`} value={reportDetails.inspectionDate} onChange={handleDataChange} />
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="inspectionReason" className="form-label">
                        Motivo de la Inspección
                    </label>
                    <textarea
                        id="inspectionReason"
                        rows={3}
                        className="form-input mt-1"
                        placeholder="Ej: Verificación para trámite TE1, auditoría interna, levantamiento, etc."
                        value={reportDetails.inspectionReason}
                        onChange={handleDataChange}
                    />
                </div>

                <h2 id="checklist-title" className="text-xl font-semibold my-6 text-gray-900 dark:text-white">2. Checklist y Evidencias</h2>
                <div className="space-y-4">
                    {inspectionPoints.map(p => (
                        <div key={p.id} className="border rounded-lg dark:border-gray-700 overflow-hidden">
                            <div className="p-4 cursor-pointer flex justify-between items-center bg-gray-50 dark:bg-gray-800/50" onClick={() => togglePoint(p.id)}>
                                <h3 className="font-semibold text-lg">{p.title}</h3>
                                <span className={`text-xl transition-transform duration-200 transform ${p.isOpen ? 'rotate-180' : ''}`}>▼</span>
                            </div>
                            {p.isOpen && (
                                <div className="p-4 border-t dark:border-gray-700 space-y-4">
                                    <div className={`flex flex-wrap gap-3 p-2 rounded-lg border transition-all ${hasStatusError && p.status === '' ? 'border-red-500 ring-1 ring-red-500 bg-red-50 dark:bg-red-900/10' : 'border-transparent'}`}>
                                        {(['Bueno', 'Regular', 'Malo'] as const).map(status => (
                                            <React.Fragment key={status}>
                                                <input type="radio" id={`status-${status.toLowerCase()}-${p.id}`} name={`status-${p.id}`} value={status} checked={p.status === status} onChange={() => handlePointChange(p.id, 'status', status)} className="hidden" />
                                                <label htmlFor={`status-${status.toLowerCase()}-${p.id}`} className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 ${p.status === status ? (status === 'Bueno' ? 'bg-green-500 text-white' : status === 'Regular' ? 'bg-yellow-400 text-gray-800' : status === 'Malo' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200') : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}>{status}</label>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div>
                                        <label className="form-label text-sm">Observación General del Punto:</label>
                                        <textarea rows={3} placeholder="Ej: Cumple con la norma, se recomienda revisión en 1 año..." className="form-input mt-1" value={p.observation} onChange={e => handlePointChange(p.id, 'observation', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="form-label text-sm">Evidencia Fotográfica:</label>
                                        {/* --- Vista para Móviles: Botones explícitos --- */}
                                        <div className="flex flex-col sm:hidden gap-4 mt-2">
                                            <label htmlFor={`camera-upload-${p.id}`} className="btn btn-secondary flex-1 cursor-pointer flex items-center justify-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l1.416-2.356A2 2 0 0111 3h2a2 2 0 011.664.89l1.416 2.356A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                Tomar Foto
                                            </label>
                                            <input id={`camera-upload-${p.id}`} type="file" className="hidden" multiple accept="image/*" capture="environment" onChange={e => handleFileInputChange(e, p.id)} />
                                            <label htmlFor={`gallery-upload-${p.id}`} className="btn btn-outline flex-1 cursor-pointer flex items-center justify-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                Elegir de Galería
                                            </label>
                                            <input id={`gallery-upload-${p.id}`} type="file" className="hidden" multiple accept="image/*" onChange={e => handleFileInputChange(e, p.id)} />
                                        </div>

                                        {/* --- Vista para Escritorio: Arrastrar y Soltar --- */}
                                        <label htmlFor={`file-upload-${p.id}`} className={`hidden sm:flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors mt-2 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, p.id)}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" /></svg>
                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Haz clic para cargar</span> o arrastra y suelta</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG, etc.</p>
                                            </div>
                                            <input id={`file-upload-${p.id}`} type="file" className="hidden" multiple accept="image/*" onChange={e => handleFileInputChange(e, p.id)} />
                                        </label>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                            {p.images.map((img, idx) => (
                                                <div key={idx} className="relative group card overflow-hidden p-0">
                                                    <div className="relative h-40 w-full">
                                                        <NextImage src={img.src} alt={`Evidencia ${idx + 1}`} layout="fill" objectFit="cover" />
                                                        <button onClick={() => deleteImage(p.id, idx)} className="absolute top-1 right-1 btn btn-sm bg-red-500 hover:bg-red-600 h-7 w-7 opacity-70 group-hover:opacity-100 flex items-center justify-center"><span className="text-lg">×</span></button>
                                                    </div>
                                                    <div className="p-2 flex-grow flex flex-col justify-between">
                                                        {editingImage?.pointId === p.id && editingImage?.imageIndex === idx ? (
                                                            <div className="space-y-2">
                                                                <textarea autoFocus value={tempDescription} onChange={(e) => setTempDescription(e.target.value)} className="form-input text-sm" rows={3} />
                                                                <div className="flex justify-end gap-2">
                                                                    <button className="btn btn-primary btn-sm" onClick={handleCancelEdit}>Cancelar</button>
                                                                    <button className="btn btn-secondary btn-sm" onClick={handleSaveDescription}>Guardar</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2 flex flex-col h-full">
                                                                {img.description ? (
                                                                    <div className="flex flex-col h-full justify-between flex-grow">
                                                                        <div className="form-input text-sm min-h-[70px] flex-grow p-2">{img.description}</div>
                                                                        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 mt-auto">
                                                                            <button className="btn btn-secondary btn-sm" onClick={() => handleEnterEditMode(p.id, idx, img.description)}>Editar</button>
                                                                            <button className="btn btn-sm bg-red-600 hover:bg-red-800 cursor-pointer" onClick={() => handleDeleteDescription(p.id, idx)}>Eliminar</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <button className="btn btn-secondary w-full mt-auto cursor-pointer" onClick={() => handleEnterEditMode(p.id, idx, img.description)}>Agregar descripción</button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>)}
                        </div>
                    ))}
                </div>

                <h2 className="text-xl font-semibold my-6 text-gray-900 dark:text-white">3. Añadir Otro Punto</h2>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <input value={customItemName} onChange={e => setCustomItemName(e.target.value)} placeholder="Nombre del nuevo punto de inspección..." className="form-input flex-grow" />
                    <button onClick={addCustomItem} className="btn btn-secondary w-full sm:w-auto">Agregar Punto</button>
                </div>

                <h2 className="text-xl font-semibold my-6 text-gray-900 dark:text-white">4. Resumen y Conclusiones</h2>
                <div>
                    <label htmlFor="summaryNotes" className="form-label">Observaciones generales, conclusiones y recomendaciones:</label>
                    <textarea id="summaryNotes" rows={5} className="form-input mt-1" value={reportDetails.summaryNotes} onChange={handleDataChange} placeholder="Ej: La instalación cumple con la normativa vigente, con observaciones menores en..." />
                </div>

                <div className="mt-8">
                    {isLoading ? (
                        <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">Generando PDF, por favor espere...</div>
                    ) : (
                        <button onClick={validateAndGenerate} className="btn btn-primary w-full font-bold">
                            Generar Informe PDF.
                        </button>
                    )}
                </div>

                {/* Modal de Validación */}
                {showErrorModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                                Faltan Datos Requeridos
                            </h3>
                            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                                {Object.values(formErrors).some(Boolean) ? (
                                    (hasImagesError || hasStatusError) ? 
                                        <>Por favor, complete los <strong>Datos de la Inspección</strong> y asegúrese de llenar el <strong>Checklist</strong> (Estados y Fotos).</> :
                                        <>Por favor, complete todos los campos de la sección <strong>&quot;Datos de la Inspección&quot;</strong> antes de generar el informe.</>
                                ) : (
                                    hasImagesError && hasStatusError ? 
                                        <>Debe seleccionar un <strong>estado</strong> (Bueno, Regular, Malo) y agregar al menos una <strong>fotografía</strong>.</> :
                                    hasStatusError ?
                                        <>Debe calificar al menos un punto con estado <strong>Bueno, Regular o Malo</strong>.</> :
                                        <>El informe debe contener al menos una <strong>fotografía</strong> en cualquiera de los puntos.</>
                                )}
                            </p>
                            <button 
                                onClick={handleCloseModal}
                                className="w-full btn btn-primary py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
                            >
                                Entendido, completar datos
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InformeInspeccionPage;
