'use client';
import { useState, useEffect, DragEvent } from 'react';
import jsPDF from 'jspdf';
import Link from 'next/link';
import Image from 'next/image';

// --- Interfaces y Datos --- 
interface Image {
    src: string;
    description: string;
}

interface ReportSection {
    id: string;
    title: string;
    images: Image[];
    isOpen: boolean;
}

interface EditingImage {
    sectionId: string;
    imageIndex: number;
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

    const handleImageChange = (sectionId: string, files: FileList | null) => {
        if (!files) return;
        const section = sections.find(s => s.id === sectionId);
        if (!section) return;

        const newImages: Image[] = [];
        const filePromises = Array.from(files).map(file => {
            return new Promise<void>(resolve => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    newImages.push({ src: event.target?.result as string, description: '' });
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(filePromises).then(() => {
            setSections(sections.map(s => 
                s.id === sectionId ? { ...s, images: [...s.images, ...newImages] } : s
            ));
        });
    };

    const updateImageDescription = (sectionId: string, imageIndex: number, description: string) => {
        setSections(sections.map(s => {
            if (s.id === sectionId) {
                const updatedImages = s.images.map((img, idx) => 
                    idx === imageIndex ? { ...img, description } : img
                );
                return { ...s, images: updatedImages };
            }
            return s;
        }));
    };

    const deleteImage = (sectionId: string, imageIndex: number) => {
        setSections(sections.map(s => {
            if (s.id === sectionId) {
                return { ...s, images: s.images.filter((_, idx) => idx !== imageIndex) };
            }
            return s;
        }));
    };

    // --- Handlers para Edición de Descripción ---
    const handleEnterEditMode = (sectionId: string, imageIndex: number, currentDescription: string) => {
        setEditingImage({ sectionId, imageIndex });
        setTempDescription(currentDescription);
    };

    const handleSaveDescription = () => {
        if (editingImage) {
            updateImageDescription(editingImage.sectionId, editingImage.imageIndex, tempDescription);
            setEditingImage(null);
            setTempDescription('');
        }
    };

    const handleCancelEdit = () => {
        setEditingImage(null);
        setTempDescription('');
    };

    const handleDeleteDescription = (sectionId: string, imageIndex: number) => {
        updateImageDescription(sectionId, imageIndex, '');
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
            handleImageChange(sectionId, files);
        }
    };

    // --- Generación de PDF (sin cambios en la lógica interna) ---
    const generatePdf = async () => {
        setIsLoading(true);
        
        // Pequeña pausa para que el UI se actualice
        await new Promise(resolve => setTimeout(resolve, 50)); 

        try {
            const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const reportData = {
                projectName: projectName || 'No especificado',
                projectAddress: projectAddress || 'No especificada',
                installerName: installerName || 'No especificado',
                reportDate,
                sections: sections.filter(s => s.images.length > 0)
            };

            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 15;

            // Portada
            doc.setDrawColor(0, 86, 179); doc.setLineWidth(1.5);
            doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(24);
            doc.text('Informe Fotográfico', pageWidth / 2, 60, { align: 'center' });
            doc.setFontSize(18); doc.text('Instalación Eléctrica', pageWidth / 2, 72, { align: 'center' });
            doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
            doc.text('En conformidad al punto 6.4 del Pliego Técnico Normativo RIC N°18', pageWidth / 2, 90, { align: 'center' });
            const boxY = 130, boxHeight = 60;
            doc.setLineWidth(0.5); doc.rect(margin, boxY, pageWidth - (margin * 2), boxHeight);
            const details = [
                { label: 'Proyecto:', value: reportData.projectName }, { label: 'Dirección:', value: reportData.projectAddress },
                { label: 'Instalador:', value: reportData.installerName }, { label: 'Fecha:', value: reportData.reportDate }
            ];
            let textY = boxY + 15;
            details.forEach(detail => {
                doc.setFont('helvetica', 'bold'); doc.text(detail.label, margin + 10, textY);
                doc.setFont('helvetica', 'normal'); doc.text(detail.value, margin + 40, textY);
                textY += 12;
            });

            // Contenido
            if (reportData.sections.length > 0) {
                let yPosition = 0;
                const newPage = () => { doc.addPage(); yPosition = margin + 10; };
                newPage();

                reportData.sections.forEach(section => {
                    if (yPosition + 15 > pageHeight - margin) newPage();
                    doc.setFillColor(230, 230, 230);
                    doc.rect(margin, yPosition, pageWidth - (margin * 2), 10, 'F');
                    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
                    doc.text(section.title, margin + 2, yPosition + 7);
                    yPosition += 15;
                    doc.setFont('helvetica', 'normal');

                    section.images.forEach((image, index) => {
                        const imgWidth = 80;
                        const imgProps = doc.getImageProperties(image.src);
                        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                        doc.setFontSize(9);
                        const descLines = image.description ? doc.splitTextToSize(image.description, pageWidth - margin * 2 - imgWidth - 5) : [''];
                        const descHeight = (descLines.length * doc.getLineHeight()) / doc.internal.scaleFactor;
                        const blockHeight = Math.max(imgHeight, descHeight) + 10;
                        
                        if (yPosition + blockHeight > pageHeight - margin) newPage();

                        doc.addImage(image.src, 'JPEG', margin, yPosition, imgWidth, imgHeight);
                        if (image.description) {
                            doc.setTextColor(80);
                            doc.text(descLines, margin + imgWidth + 5, yPosition);
                            doc.setTextColor(0);
                        }
                        
                        if (index < section.images.length - 1) {
                            const lineY = yPosition + blockHeight - 5;
                            doc.setDrawColor(220); doc.setLineWidth(0.2);
                            doc.line(margin, lineY, pageWidth - margin, lineY);
                            doc.setDrawColor(0);
                        }
                        yPosition += blockHeight;
                    });
                });
            }

            // Encabezados y Pies de Página
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const totalPages = (doc.internal as any).getNumberOfPages();
            for (let i = 2; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(9); doc.setTextColor(150);
                doc.text(reportData.projectName, margin, 10);
                doc.line(margin, 12, pageWidth - margin, 12);
                const footerText = `Página ${i} de ${totalPages}`;
                doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
                doc.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });
                doc.setTextColor(0);
            }

            doc.save(`Informe_Fotografico_${reportData.projectName.replace(/ /g, '_')}.pdf`);

        } catch (error) {
            console.error("Error generando el PDF:", error);
            alert("Ocurrió un error al generar el PDF. Por favor, revise la consola.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Renderizado del Componente ---
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Generador de Informe Fotográfico SEC</h1>
                <p className="text-gray-600 dark:text-gray-400">Cumplimiento del punto 6.4 del Pliego Técnico Normativo RIC N°18.</p>
                <br />
                <Link href="/calculadoras" className="text-amber-500 hover:text-amber-600 inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a calculadoras
                </Link>
            </div>

            <div className="card">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">1. Datos del Proyecto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                    <div>
                        <label htmlFor="projectName" className="form-label">Nombre del Proyecto</label>
                        <input id="projectName" className="form-input" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Ej: Vivienda Unifamiliar Pérez"/>
                    </div>
                    <div>
                        <label htmlFor="projectAddress" className="form-label">Dirección de la Obra</label>
                        <input id="projectAddress" className="form-input" value={projectAddress} onChange={e => setProjectAddress(e.target.value)} placeholder="Ej: Av. Principal 123, Santiago"/>
                    </div>
                    <div>
                        <label htmlFor="installerName" className="form-label">Instalador (Licencia SEC)</label>
                        <input id="installerName" className="form-input" value={installerName} onChange={e => setInstallerName(e.target.value)} placeholder="Ej: Juan González (Clase B - 12345)"/>
                    </div>
                    <div>
                        <label htmlFor="reportDate" className="form-label">Fecha del Informe</label>
                        <input type="date" id="reportDate" className="form-input" value={reportDate} onChange={e => setReportDate(e.target.value)}/>
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
                                        <input id={`camera-upload-${section.id}`} type="file" className="hidden" multiple accept="image/*" capture="environment" onChange={e => handleImageChange(section.id, e.target.files)} />
                                        <label htmlFor={`gallery-upload-${section.id}`} className="btn btn-outline flex-1 cursor-pointer flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            Elegir de Galería
                                        </label>
                                        <input id={`gallery-upload-${section.id}`} type="file" className="hidden" multiple accept="image/*" onChange={e => handleImageChange(section.id, e.target.files)} />
                                    </div>

                                    {/* --- Vista para Escritorio: Arrastrar y Soltar --- */}
                                    <label htmlFor={`file-upload-${section.id}`} className={`hidden sm:flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, section.id)}>
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Haz clic para cargar</span> o arrastra y suelta</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
                                        </div>
                                        <input id={`file-upload-${section.id}`} type="file" className="hidden" multiple accept="image/*" onChange={e => handleImageChange(section.id, e.target.files)} />
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                                        {section.images.map((image, index) => (
                                            <div key={index} className="card overflow-hidden p-0">
                                                <div className="relative h-40 w-full group">
                                                    <Image src={image.src} alt={`Preview ${index}`} layout="fill" objectFit="cover" />
                                                    <div className="absolute top-1 right-1">
                                                        <button className="btn btn-sm bg-red-400 hover:bg-red-600 cursor-pointer h-7 w-7 opacity-70 group-hover:opacity-100 flex items-center justify-center" onClick={() => deleteImage(section.id, index)}>
                                                            <span className="text-lg">×</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-2 flex-grow flex flex-col justify-between">
                                                    {editingImage?.sectionId === section.id && editingImage?.imageIndex === index ? (
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
                                                                        <button className="btn btn-secondary btn-sm" onClick={() => handleEnterEditMode(section.id, index, image.description)}>Editar</button>
                                                                        <button className="btn btn-sm bg-red-600 hover:bg-red-800 cursor-pointer" onClick={() => handleDeleteDescription(section.id, index)}>Eliminar</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button className="btn btn-secondary w-full mt-auto cursor-pointer" onClick={() => handleEnterEditMode(section.id, index, image.description)}>Agregar descripción</button>
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

export default InformeFotograficoSECPage;