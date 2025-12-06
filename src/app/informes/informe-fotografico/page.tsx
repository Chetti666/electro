'use client';
import React, { useState, useEffect, DragEvent } from 'react';
import imageCompression from 'browser-image-compression';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import Link from 'next/link';
import NextImage from 'next/image';

// --- Interfaces y Datos --- 
interface ReportImage {
    id: string;
    src: string;
    description: string;
    orientation: 'horizontal' | 'vertical';
}

interface ReportSection {
    id: string;
    title: string;
    images: ReportImage[];
    isOpen: boolean;
}

interface EditingImage {
    sectionId: string;
    imageId: string;
}

const defaultSectionsData = [
    { id: 'propiedad', title: '6.4.2.1 Numeración de la Propiedad' },
    { id: 'tableroGeneral', title: '6.4.2.2 Tablero General' },
    { id: 'tableroDist', title: '6.4.2.3 Tablero de Distribución' },
    { id: 'tableroCond', title: '6.4.2.4 Tablero de Banco de Condensadores (si aplica)' },
    { id: 'tableroTransf', title: '6.4.2.5 Tablero de Transferencia Automática (si aplica)' },
    { id: 'canalizacion', title: '6.4.2.6 Canalización General' },
    { id: 'canalizacionSub', title: '6.4.2.7 Canalización Subterránea (si aplica)' },
    { id: 'canalizacionAer', title: '6.4.2.8 Canalización Aérea (si aplica)' },
    { id: 'puestaTierra', title: '6.4.2.9 Sistema de Puesta a Tierra' },
    { id: 'aparatos', title: '6.4.2.10 Aparatos Eléctricos (Interruptores y Enchufes)' },
    { id: 'iluminacion', title: '6.4.2.11 Equipos de Iluminación' },
    { id: 'respaldo', title: '6.4.2.13 Sistema de Respaldo de Energía (si aplica)' }
];

const InformeFotograficoSECPage = () => {
    // --- Estados del Componente ---
    const [projectName, setProjectName] = useState('');
    const [projectAddress, setProjectAddress] = useState('');
    const [installerName, setInstallerName] = useState('');
    const [reportDate, setReportDate] = useState('');
    const [sections, setSections] = useState<ReportSection[]>([]);
    const [customSectionName, setCustomSectionName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [editingImage, setEditingImage] = useState<EditingImage | null>(null);
    const [tempDescription, setTempDescription] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showWarningPopup, setShowWarningPopup] = useState(false);

    useEffect(() => {
        setReportDate(new Date().toISOString().split('T')[0]);
        setSections(defaultSectionsData.map(s => ({ ...s, images: [], isOpen: false })));
    }, []);

    // --- Manejadores de Estado ---
    const toggleSection = (id: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, isOpen: !s.isOpen } : s));
    };

    const addCustomSection = () => {
        if (customSectionName.trim()) {
            const newSection: ReportSection = {
                id: 'custom-' + Date.now(),
                title: customSectionName.trim(),
                images: [],
                isOpen: true,
            };
            setSections([...sections, newSection]);
            setCustomSectionName('');
        }
    };

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, fieldName: string, value: string) => {
        setter(value);
        // Si el campo estaba en los errores, lo quitamos al empezar a escribir
        if (validationErrors.includes(fieldName)) {
            setValidationErrors(prev => prev.filter(err => err !== fieldName));
        }
    };

    const handleImageChange = async (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

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
                const orientation = await new Promise<'horizontal' | 'vertical'>(resolve => {
                    const img = new window.Image();
                    img.onload = () => resolve(img.naturalWidth >= img.naturalHeight ? 'horizontal' : 'vertical');
                    img.onerror = () => resolve('horizontal'); // Fallback orientation
                    img.src = imageSrc;
                });
                return { id: `${file.name}-${Date.now()}`, src: imageSrc, description: '', orientation };
            } catch (error) {
                console.error("Error al procesar la imagen:", error);
                // Fallback: si la compresión falla, leer el archivo original.
                return new Promise<ReportImage | null>(resolve => {
                    const reader = new FileReader();
                    reader.onload = async event => {
                        if (event.target && typeof event.target.result === 'string') {
                            const imageSrc = event.target.result;
                            const orientation = await new Promise<'horizontal' | 'vertical'>(res => {
                                const img = new window.Image();
                                img.onload = () => res(img.naturalWidth >= img.naturalHeight ? 'horizontal' : 'vertical');
                                img.onerror = () => res('horizontal');
                                img.src = imageSrc;
                            });
                            resolve({ id: `${file.name}-${Date.now()}`, src: imageSrc, description: '', orientation });
                        } else {
                            resolve(null);
                        }
                    };
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                });
            }
        });

        const newImages = await Promise.all(filePromises);
        const validImages = newImages.filter((img): img is ReportImage => img !== null);
        setSections(prev => prev.map(s => s.id === sectionId ? { ...s, images: [...s.images, ...validImages] } : s));
        e.target.value = ''; // Resetear el input
    };

    const updateImageDescription = (sectionId: string, imageId: string, description: string) => {
        setSections(sections.map(s => {
            if (s.id === sectionId) {
                const updatedImages = s.images.map((img) =>
                    img.id === imageId ? { ...img, description } : img
                );
                return { ...s, images: updatedImages };
            }
            return s;
        }));
    };

    const deleteImage = (sectionId: string, imageId: string) => {
        setSections(sections.map(s => {
            if (s.id === sectionId) {
                return { ...s, images: s.images.filter(img => img.id !== imageId) };
            }
            return s;
        }));
    };

    // --- Handlers para Edición de Descripción ---
    const handleEnterEditMode = (sectionId: string, imageId: string, currentDescription: string) => {
        setEditingImage({ sectionId, imageId });
        setTempDescription(currentDescription);
    };

    const handleSaveDescription = () => {
        if (editingImage) {
            updateImageDescription(editingImage.sectionId, editingImage.imageId, tempDescription);
            setEditingImage(null);
            setTempDescription('');
        }
    };

    const handleCancelEdit = () => {
        setEditingImage(null);
        setTempDescription('');
    };

    const handleDeleteDescription = (sectionId: string, imageId: string) => {
        updateImageDescription(sectionId, imageId, '');
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

    const handleDrop = (e: DragEvent<HTMLLabelElement>, sectionId: string) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleImageChange(sectionId, { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>);
        }
    };

    // --- Generación de PDF (sin cambios en la lógica interna) ---
    const generatePdf = async () => {
        const missingFields: string[] = [];
        if (!projectName.trim()) missingFields.push('projectName');
        if (!projectAddress.trim()) missingFields.push('projectAddress');
        if (!installerName.trim()) missingFields.push('installerName');
        if (!reportDate) missingFields.push('reportDate');

        if (missingFields.length > 0) {
            setValidationErrors(missingFields);
            setShowWarningPopup(true);

            const firstErrorField = document.getElementById(missingFields[0]);
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }
            return;
        }
        setValidationErrors([]); // Limpiar errores si todo está bien

        setIsLoading(true);

        // Pequeña pausa para que el UI se actualice
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const doc = new jsPDF('p', 'mm', [210, 279]);
            const reportData = {
                projectName: projectName || 'No especificado',
                projectAddress: projectAddress || 'No especificada',
                installerName: installerName || 'No especificado',
                reportDate: reportDate ? new Date(reportDate + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : "No especificada",
                sections: sections.filter(s => s.images.length > 0)
            };

            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 15;
            const contentWidth = pageWidth - margin * 2;

            // Portada
            doc.setDrawColor(0, 86, 179); doc.setLineWidth(1.5);
            doc.rect(margin, margin - 6, contentWidth, pageHeight - (margin - 6) - margin);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(24);
            doc.text('Informe Fotográfico', pageWidth / 2, 60, { align: 'center' });
            doc.setFontSize(18); doc.text('Instalación Eléctrica', pageWidth / 2, 72, { align: 'center' });
            doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
            doc.text('En conformidad al punto 6.4 del Pliego Técnico Normativo RIC N°18', pageWidth / 2, 90, { align: 'center' });

            const details = [
                [{ content: 'Proyecto:', styles: { fontStyle: 'bold' as const } }, reportData.projectName],
                [{ content: 'Dirección:', styles: { fontStyle: 'bold' as const } }, reportData.projectAddress],
                [{ content: 'Instalador:', styles: { fontStyle: 'bold' as const } }, reportData.installerName],
                [{ content: 'Fecha de Emisión:', styles: { fontStyle: 'bold' as const } }, reportData.reportDate],
            ];

            autoTable(doc, {
                startY: 120,
                body: details,
                theme: 'plain',
                styles: { fontSize: 12, cellPadding: 2 },
                columnStyles: { 0: { cellWidth: 50 } },
                margin: { left: margin, right: margin }
            });

            // Contenido
            if (reportData.sections.length > 0) {
                let yPosition = 0;
                const applyTitleStyle = () => {
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.setDrawColor(0, 86, 179); // Azul para el subrayado
                };
                const newPage = () => {
                    doc.addPage();
                    yPosition = margin + 1;
                    applyTitleStyle(); // Re-aplicar estilo en cada nueva página
                };
                newPage();

                reportData.sections.forEach(section => {
                    // Separar imágenes por orientación
                    const horizontalImages = section.images.filter(img => img.orientation === 'horizontal');
                    const verticalImages = section.images.filter(img => img.orientation === 'vertical');

                    const hasContent = horizontalImages.length > 0 || verticalImages.length > 0;

                    if (!hasContent) return; // Si no hay imágenes, no renderizar la sección

                    // Estimar la altura de la primera fila de imágenes para evitar títulos huérfanos
                    let requiredHeight = 15; // Altura del título + un pequeño margen
                    const imagesToEstimate = horizontalImages.length > 0 ? horizontalImages : verticalImages;
                    if (imagesToEstimate.length > 0) {
                        const firstImage = imagesToEstimate[0];
                        const maxImgWidth = 80;
                        const maxImgHeight = 85;
                        const imgProps = doc.getImageProperties(firstImage.src);
                        let imgWidth = (maxImgHeight / imgProps.height) * imgProps.width;
                        if (imgWidth > maxImgWidth) imgWidth = maxImgWidth;
                        const imgHeight = (imgWidth / imgProps.width) * imgProps.height;

                        const descLines = firstImage.description ? doc.splitTextToSize(`Figura 1: ${firstImage.description}`, imgWidth) : [];
                        const descHeight = descLines.length * (doc.getFontSize() * 0.35);
                        requiredHeight += imgHeight + (firstImage.description ? descHeight + 10 : 5);
                    }

                    // Solo dibujar el título si hay imágenes
                    if (yPosition + requiredHeight > pageHeight - margin) {
                        newPage();
                    }
                    applyTitleStyle();
                    doc.text(section.title, margin, yPosition);
                    const textWidth = doc.getStringUnitWidth(section.title) * doc.getFontSize() / doc.internal.scaleFactor;
                    doc.setLineWidth(0.3);
                    doc.line(margin, yPosition + 1, margin + textWidth, yPosition + 1);
                    yPosition += 10;
                    doc.setFont('helvetica', 'normal');


                    // Función reutilizable para renderizar un grupo de imágenes
                    const renderImageGroup = (images: ReportImage[], startY: number, figureStartIndex: number): number => {
                        let currentY = startY;
                        let currentRowMaxHeight = 0;

                        images.forEach((image, index) => {
                            const maxImgWidth = 80;
                            const maxImgHeight = 85;
                            const imgProps = doc.getImageProperties(image.src);

                            let imgWidth = imgProps.width;
                            let imgHeight = imgProps.height;

                            if (imgHeight > maxImgHeight) {
                                imgWidth = (maxImgHeight / imgHeight) * imgWidth;
                                imgHeight = maxImgHeight;
                            }
                            if (imgWidth > maxImgWidth) {
                                imgHeight = (maxImgWidth / imgWidth) * imgHeight;
                                imgWidth = maxImgWidth;
                            }

                            const isLeftColumn = index % 2 === 0;
                            const xPos = isLeftColumn ? margin : margin + maxImgWidth + 10;

                            const figureNumber = figureStartIndex + index + 1;
                            const descLines = image.description ? doc.splitTextToSize(`Figura ${figureNumber}: ${image.description}`, imgWidth) : [];
                            const descHeight = descLines.length * (doc.getFontSize() * 0.35);
                            const blockHeight = imgHeight + (image.description ? descHeight + 10 : 5);

                            if (isLeftColumn) {
                                currentRowMaxHeight = blockHeight;
                                if (currentY + currentRowMaxHeight > pageHeight - margin) {
                                    newPage();
                                    currentY = yPosition; // yPosition es global y se actualiza en newPage()
                                }
                            } else {
                                currentRowMaxHeight = Math.max(currentRowMaxHeight, blockHeight);
                            }

                            doc.addImage(image.src, 'JPEG', xPos, currentY, imgWidth, imgHeight);
                            doc.setFontSize(10);
                            doc.setTextColor(80);

                            const figureText = `Figura ${figureNumber}`;
                            doc.setFont('helvetica', 'bold');

                            if (image.description) {
                                const figureTextWithColon = `${figureText}:`;
                                const descText = image.description;
                                doc.text(figureTextWithColon, xPos, currentY + imgHeight + 5);
                                const figureTextWidth = doc.getStringUnitWidth(figureTextWithColon) * doc.getFontSize() / doc.internal.scaleFactor;
                                doc.setFont('helvetica', 'normal');
                                doc.text(descText, xPos + figureTextWidth + 1, currentY + imgHeight + 5, { maxWidth: imgWidth - figureTextWidth - 1 });
                            } else {
                                doc.text(figureText, xPos, currentY + imgHeight + 5);
                            }

                            if (!isLeftColumn || index === images.length - 1) {
                                currentY += currentRowMaxHeight + 10;
                                if (index < images.length - 1) {
                                    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
                                    doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);
                                }
                                currentRowMaxHeight = 0;
                            }
                        });
                        return currentY;
                    };

                    // Renderizar primero las horizontales y luego las verticales
                    const yAfterHorizontals = renderImageGroup(horizontalImages, yPosition, 0);

                    if (horizontalImages.length > 0 && verticalImages.length > 0 && yAfterHorizontals > yPosition) {
                        // Añadir un separador más grueso entre grupos si ambos existen
                        doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.4);
                        doc.line(margin, yAfterHorizontals - 5, pageWidth - margin, yAfterHorizontals - 5);
                    }

                    const yAfterVerticals = renderImageGroup(verticalImages, yAfterHorizontals, horizontalImages.length);
                    yPosition = yAfterVerticals; // Actualizar yPosition global para la siguiente sección
                });
            }


            // Encabezados y Pies de Página
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const totalPages = (doc.internal as any).getNumberOfPages();
            for (let i = 2; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(9); doc.setTextColor(150);
                doc.text(`Informe Fotográfico - ${reportData.projectName}`, margin, margin - 8);
                doc.line(margin, margin - 6, contentWidth + margin, margin - 6);
                const footerText = `Página ${i} de ${totalPages}`;
                doc.line(margin, pageHeight - margin, contentWidth + margin, pageHeight - margin);
                doc.text(footerText, pageWidth / 2, pageHeight - margin + 4, { align: 'center' });
                doc.setTextColor(0);
            }

            doc.save(`Informe_Fotografico_${reportData.projectName.replace(/ /g, '_')}.pdf`);

        } catch (error) {
            console.error("Error generando el PDF:", error);
            alert("Ocurrió un error al generar el PDF. Por favor, revise la consola");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Renderizado del Componente ---
    return (
        <div className="container mx-auto px-4 pt-24 pb-12 md:pt-32">
            {/* --- Pop-up de Advertencia --- */}
            {showWarningPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 mb-4">
                            <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Datos Incompletos</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-6">
                            Por favor, complete todos los datos del proyecto antes de generar el informe. Los campos que faltan se han resaltado en rojo.
                        </p>
                        <button
                            onClick={() => setShowWarningPopup(false)}
                            className="btn btn-primary w-full"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
            {/*
              Solución mejorada para el icono y texto del calendario en modo oscuro.
              Usa media queries para detectar el tema del sistema operativo,
              haciéndolo más compatible.
             */}
            <style jsx global>{`
              @media (prefers-color-scheme: dark) {
                input[type="date"]::-webkit-calendar-picker-indicator {
                  filter: invert(1);
                }
              }
            `}</style>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Generador de Informe Fotográfico SEC</h1>
                <p className="text-gray-600 dark:text-gray-400">Cumplimiento del punto 6.4 del Pliego Técnico Normativo RIC N°18.</p>
                <br />
                <Link href="/informes" className="text-amber-500 hover:text-amber-600 inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a informes
                </Link>
            </div>

            <div className="card">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">1. Datos del Proyecto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                    <div>
                        <label htmlFor="projectName" className="form-label">Nombre del Proyecto</label>
                        <input id="projectName" className={`form-input ${validationErrors.includes('projectName') ? 'border-red-500' : ''}`} value={projectName} onChange={e => handleInputChange(setProjectName, 'projectName', e.target.value)} placeholder="Ej: Vivienda Unifamiliar Pérez" />
                    </div>
                    <div>
                        <label htmlFor="projectAddress" className="form-label">Dirección de la Obra</label>
                        <input id="projectAddress" className={`form-input ${validationErrors.includes('projectAddress') ? 'border-red-500' : ''}`} value={projectAddress} onChange={e => handleInputChange(setProjectAddress, 'projectAddress', e.target.value)} placeholder="Ej: Av. Principal 123, Santiago" />
                    </div>
                    <div>
                        <label htmlFor="installerName" className="form-label">Instalador (Licencia SEC)</label>
                        <input id="installerName" className={`form-input ${validationErrors.includes('installerName') ? 'border-red-500' : ''}`} value={installerName} onChange={e => handleInputChange(setInstallerName, 'installerName', e.target.value)} placeholder="Ej: Juan González (Clase B - 12345)" />
                    </div>
                    <div>
                        <label htmlFor="reportDate" className="form-label">Fecha del Informe</label>
                        <input type="date" id="reportDate" className={`form-input ${validationErrors.includes('reportDate') ? 'border-red-500' : ''}`} value={reportDate} onChange={e => handleInputChange(setReportDate, 'reportDate', e.target.value)} />
                    </div>
                </div>

                <h2 className="text-xl font-semibold my-6 text-gray-900 dark:text-white">2. Cargar Fotografías por Sección</h2>
                <div className="space-y-4">
                    {sections.map(section => (
                        <div key={section.id} className="border rounded-lg dark:border-gray-700 overflow-hidden">
                            <div className="p-4 cursor-pointer flex justify-between items-center bg-gray-50 dark:bg-gray-800/50" onClick={() => toggleSection(section.id)}>
                                <h3 className="font-semibold text-lg">{section.title}</h3>
                                <span className={`text-xl transition-transform duration-200 transform ${section.isOpen ? 'rotate-180' : ''}`}>▼</span>
                            </div>
                            {section.isOpen && (
                                <div className="p-4 border-t dark:border-gray-700">
                                    {/* --- Vista para Móviles: Botones explícitos --- */}
                                    <div className="flex flex-col sm:hidden gap-4">
                                        <label htmlFor={`camera-upload-${section.id}`} className="btn btn-secondary flex-1 cursor-pointer flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l1.416-2.356A2 2 0 0111 3h2a2 2 0 011.664.89l1.416 2.356A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            Tomar Foto
                                        </label>
                                        <input id={`camera-upload-${section.id}`} type="file" className="hidden" multiple accept="image/*" capture="environment" onChange={e => handleImageChange(section.id, e)} />
                                        <label htmlFor={`gallery-upload-${section.id}`} className="btn btn-outline flex-1 cursor-pointer flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            Elegir de Galería
                                        </label>
                                        <input id={`gallery-upload-${section.id}`} type="file" className="hidden" multiple accept="image/*" onChange={e => handleImageChange(section.id, e)} />
                                    </div>

                                    {/* --- Vista para Escritorio: Arrastrar y Soltar --- */}
                                    <label htmlFor={`file-upload-${section.id}`} className={`hidden sm:flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, section.id)}>
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" /></svg>
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Haz clic para cargar</span> o arrastra y suelta</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
                                        </div>
                                        <input id={`file-upload-${section.id}`} type="file" className="hidden" multiple accept="image/*" onChange={e => handleImageChange(section.id, e)} />
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                                        {/* Ordenar imágenes para agrupar por orientación (horizontales primero) */}
                                        {[...section.images].sort((a, b) => {
                                            if (a.orientation === 'horizontal' && b.orientation === 'vertical') return -1;
                                            if (a.orientation === 'vertical' && b.orientation === 'horizontal') return 1;
                                            return 0;
                                        }).map((image) => (
                                            <div key={image.id} className="card overflow-hidden p-0">
                                                <div className="relative h-40 w-full group">
                                                    <NextImage src={image.src} alt={`Preview ${image.id}`} layout="fill" objectFit="cover" />
                                                    <div className="absolute top-1 right-1">
                                                        <button className="btn btn-sm bg-red-400 hover:bg-red-600 cursor-pointer h-7 w-7 opacity-70 group-hover:opacity-100 flex items-center justify-center" onClick={() => deleteImage(section.id, image.id)}>
                                                            <span className="text-lg">×</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-2 flex-grow flex flex-col justify-between">
                                                    {editingImage?.sectionId === section.id && editingImage?.imageId === image.id ? (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                autoFocus
                                                                value={tempDescription}
                                                                onChange={(e) => setTempDescription(e.target.value)}
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
                                                            {image.description ? (
                                                                <div className="flex flex-col h-full justify-between flex-grow">
                                                                    <div className="form-input text-sm min-h-[70px] flex-grow p-2">{image.description}</div>
                                                                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 mt-auto">
                                                                        <button className="btn btn-secondary btn-sm" onClick={() => handleEnterEditMode(section.id, image.id, image.description)}>Editar</button>
                                                                        <button className="btn btn-sm bg-red-600 hover:bg-red-800 cursor-pointer" onClick={() => handleDeleteDescription(section.id, image.id)}>Eliminar</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button className="btn btn-secondary w-full mt-auto cursor-pointer" onClick={() => handleEnterEditMode(section.id, image.id, image.description)}>Agregar descripción</button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <h2 className="text-xl font-semibold my-6 text-gray-900 dark:text-white">3. Nueva Categoría</h2>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <input value={customSectionName} onChange={e => setCustomSectionName(e.target.value)} placeholder="Nombre de la nueva categoría..." className="form-input flex-grow" />
                    <button onClick={addCustomSection} className="btn btn-secondary w-full sm:w-auto">Agregar Categoría</button>
                </div>

                <div className="mt-8">
                    {isLoading ? (
                        <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">Generando PDF, por favor espere....</div>
                    ) : (
                        <button onClick={generatePdf} className="btn btn-primary w-full font-bold">
                            Generar Informe PDF.
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InformeFotograficoSECPage;