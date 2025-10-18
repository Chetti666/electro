"use client";
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';

// Augment the jsPDF interface to include the autoTable plugin's property
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface Item {
  description: string;
  quantity: number;
  price: number;
}

const PresupuestoPage = () => {
    const [yourInfo, setYourInfo] = useState({ name: '', rut: '', address: '', phone: '' });
    const [clientInfo, setClientInfo] = useState({ name: '', rut: '', address: '', phone: '' });
    const [quoteInfo, setQuoteInfo] = useState({
        number: '',
        date: new Date().toISOString().split('T')[0],
        reference: ''
    });
    const [terms, setTerms] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [newItem, setNewItem] = useState<Item>({ description: '', quantity: 1, price: 0 });
    const [totals, setTotals] = useState({ neto: 0, iva: 0, total: 0 });
    const [isGenerating, setIsGenerating] = useState(false);

    const IVA_RATE = 0.19;
    const formatCurrency = (value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

    useEffect(() => {
        const neto = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const iva = neto * IVA_RATE;
        const total = neto + iva;
        setTotals({ neto, iva, total });
    }, [items]);

    const handleAddItem = () => {
        if (newItem.description && newItem.quantity > 0) {
            setItems([...items, newItem]);
            setNewItem({ description: '', quantity: 1, price: 0 });
        }
    };

    const handleDeleteItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleNewItemNumericChange = (field: 'quantity' | 'price', value: string) => {
        if (value === '') {
            setNewItem(prev => ({ ...prev, [field]: 0 }));
            return;
        }
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue) && parsedValue >= 0) {
            setNewItem(prev => ({ ...prev, [field]: parsedValue }));
        }
    };

    const handleItemChange = (index: number, field: keyof Item, value: string) => {
        const updatedItems = [...items];
        const itemToUpdate = { ...updatedItems[index] };

        if (field === 'description') {
            itemToUpdate.description = value;
        } else {
            const parsedValue = parseFloat(value);
            if (value === '') {
                itemToUpdate[field] = 0;
            } else if (!isNaN(parsedValue) && parsedValue >= 0) {
                itemToUpdate[field] = parsedValue;
            }
        }
        updatedItems[index] = itemToUpdate;
        setItems(updatedItems);
    };

    const generatePdf = () => {
        setIsGenerating(true);
        setTimeout(() => {
            try {
                const doc = new jsPDF({ unit: 'mm', format: 'a4' });
                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;
                const margin = 15;
                let y = 20;

                doc.setFontSize(20).setFont('helvetica', 'bold');
                doc.text("PRESUPUESTO", pageWidth / 2, y, { align: 'center' });
                y += 10;

                doc.setFontSize(10).setFont('helvetica', 'normal');
                doc.text(`Nº: ${quoteInfo.number}`, pageWidth - margin, y, { align: 'right' });
                doc.text(`Fecha: ${quoteInfo.date}`, pageWidth - margin, y + 5, { align: 'right' });
                doc.setLineWidth(0.5).line(margin, y + 10, pageWidth - margin, y + 10);
                y += 20;

                doc.setFontSize(11).setFont('helvetica', 'bold');
                doc.text("DE:", margin, y);
                doc.text("PARA:", pageWidth / 2 + 10, y);
                doc.setFontSize(10).setFont('helvetica', 'normal');

                const yourNameLines = doc.splitTextToSize('Nombre o Razón Social: ' + yourInfo.name, (pageWidth / 2) - margin);
                doc.text(yourNameLines, margin, y + 5);
                const yourNameHeight = yourNameLines.length * 5;

                doc.text('RUT: '+ yourInfo.rut, margin, y + 5 + yourNameHeight);
                doc.text('Dirección: '+ yourInfo.address, margin, y + 10 + yourNameHeight);
                doc.text('Teléfono: '+ yourInfo.phone, margin, y + 15 + yourNameHeight);

                const clientNameLines = doc.splitTextToSize('Nombre o Razón Social: ' + clientInfo.name, (pageWidth / 2) - margin -10);
                doc.text(clientNameLines, pageWidth / 2 + 10, y + 5);
                const clientNameHeight = clientNameLines.length * 5;

                doc.text('RUT: '+ clientInfo.rut, pageWidth / 2 + 10, y + 5 + clientNameHeight);
                doc.text('Dirección: '+ clientInfo.address, pageWidth / 2 + 10, y + 10 + clientNameHeight);
                doc.text('Teléfono: '+ clientInfo.phone, pageWidth / 2 + 10, y + 15 + clientNameHeight);

                y += Math.max(30, 15 + yourNameHeight, 15 + clientNameHeight);

                if (quoteInfo.reference) {
                    doc.setFontSize(10).setFont('helvetica', 'bold');
                    doc.text("Referencia:", margin, y);
                    doc.setFont('helvetica', 'normal');
                    const splitRef = doc.splitTextToSize(quoteInfo.reference, pageWidth - margin * 2 - 25);
                    doc.text(splitRef, margin + 25, y);
                    y += (splitRef.length * 5) + 5;
                }

                const tableData = items.map(item => [
                    item.description,
                    item.quantity,
                    formatCurrency(item.price),
                    formatCurrency(item.quantity * item.price)
                ]);

                autoTable(doc, {
                    startY: y,
                    head: [['Descripción', 'Cantidad', 'P. Unitario', 'Subtotal']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: [22, 160, 133] },
                    styles: { fontSize: 10 },
                    columnStyles: {
                        0: { cellWidth: 90 },
                        1: { cellWidth: 25, halign: 'right' },
                        2: { cellWidth: 30, halign: 'right' },
                        3: { cellWidth: 30, halign: 'right' },
                    },
                });

                y = doc.lastAutoTable.finalY + 10;

                const finalContentHeight = 40 + (terms ? 20 : 0);
                if (y + finalContentHeight > pageHeight) {
                    doc.addPage();
                    y = margin;
                }

                const totalsX_Labels = pageWidth - margin - 50;
                const totalsX_Values = pageWidth - margin;
                doc.setFontSize(11);
                doc.text("Neto:", totalsX_Labels, y);
                doc.text(formatCurrency(totals.neto), totalsX_Values, y, { align: 'right' });
                y += 7;
                doc.text(`IVA (${IVA_RATE * 100}%):`, totalsX_Labels, y);
                doc.text(formatCurrency(totals.iva), totalsX_Values, y, { align: 'right' });
                y += 5;
                doc.setDrawColor(150);
                doc.setLineWidth(0.5);
                doc.line(totalsX_Labels, y, totalsX_Values, y);
                y += 5;
                doc.setFontSize(14).setFont('helvetica', 'bold');
                doc.text("TOTAL:", totalsX_Labels, y);
                doc.text(formatCurrency(totals.total), totalsX_Values, y, { align: 'right' });
                y += 15;
                doc.setFont('helvetica', 'normal');

                if (terms) {
                    doc.setFontSize(10).setFont('helvetica', 'bold');
                    const splitTerms = doc.splitTextToSize(terms, pageWidth - margin * 2);
                    const termsHeight = (splitTerms.length * 5) + 10;
                    if (y + termsHeight > pageHeight) {
                        doc.addPage();
                        y = margin;
                    }
                    doc.text("Condiciones Comerciales:", margin, y);
                    doc.setFontSize(9).setFont('helvetica', 'normal');
                    doc.text(splitTerms, margin, y + 5);
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const totalPages = (doc.internal as any).getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    doc.setFontSize(9);
                    doc.setTextColor(150);
                    if (i > 1) {
                        const headerText = `Presupuesto Nº: ${quoteInfo.number || 'S/N'}  |  Ref: ${quoteInfo.reference || 'S/R'}`;
                        doc.text(headerText, margin, 10);
                        doc.line(margin, 12, pageWidth - margin, 12);
                    }
                    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
                    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
                }

                doc.save(`Presupuesto_${quoteInfo.number || 'sinnombre'}.pdf`);
            } catch (error) {
                console.error("Error al generar PDF:", error);
                alert("Ocurrió un error al generar el PDF. Revise la consola para más detalles.");
            } finally {
                setIsGenerating(false);
            }
        }, 50);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Generador de Presupuestos</h1>
                <p className="text-gray-600 dark:text-gray-400">Crea, edita y exporta presupuestos detallados en formato PDF.</p>
<br />
                 <Link href="/calculadoras" className="text-amber-500 hover:text-amber-600 inline-flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Volver a calculadoras
                        </Link>
            </div>

                        
                    
            <div className="card">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">1. Información General</h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Tus Datos (Emisor)</h3>
                        <div>
                            <label className="form-label mb-1">Nombre o Razón Social:</label>
                            <input className="form-input" value={yourInfo.name} onChange={e => setYourInfo({...yourInfo, name: e.target.value})} />
                        </div>
                         <div>
                            <label className="form-label mb-1">RUT:</label>
                            <input className="form-input" value={yourInfo.rut} onChange={e => setYourInfo({...yourInfo, rut: e.target.value})} />
                        </div>
                         <div>
                            <label className="form-label mb-1">Dirección:</label>
                            <input className="form-input" value={yourInfo.address} onChange={e => setYourInfo({...yourInfo, address: e.target.value})} />
                        </div>
                         <div>
                            <label className="form-label mb-1">Teléfono:</label>
                            <input className="form-input" value={yourInfo.phone} onChange={e => setYourInfo({...yourInfo, phone: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Datos del Cliente</h3>
                        <div>
                            <label className="form-label mb-1">Nombre o Razón Social:</label>
                            <input className="form-input" value={clientInfo.name} onChange={e => setClientInfo({...clientInfo, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="form-label mb-1">RUT:</label>
                            <input className="form-input" value={clientInfo.rut} onChange={e => setClientInfo({...clientInfo, rut: e.target.value})} />
                        </div>
                        <div>
                            <label className="form-label mb-1">Dirección:</label>
                            <input className="form-input" value={clientInfo.address} onChange={e => setClientInfo({...clientInfo, address: e.target.value})} />
                        </div>
                        <div>
                            <label className="form-label mb-1">Teléfono:</label>
                            <input className="form-input" value={clientInfo.phone} onChange={e => setClientInfo({...clientInfo, phone: e.target.value})} />
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="form-label mb-1">Referencia / Glosa:</label>
                        <input className="form-input" placeholder="Ej: Instalación eléctrica cocina Depto. 101" value={quoteInfo.reference} onChange={e => setQuoteInfo({...quoteInfo, reference: e.target.value})} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="form-label mb-1">Nº Presupuesto:</label>
                            <input className="form-input" value={quoteInfo.number} onChange={e => setQuoteInfo({...quoteInfo, number: e.target.value})} />
                        </div>
                        <div>
                            <label className="form-label mb-1">Fecha:</label>
                            <input type="date" className="form-input" value={quoteInfo.date} onChange={e => setQuoteInfo({...quoteInfo, date: e.target.value})} />
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">2. Ítems del Presupuesto</h2>
                <div className="flex flex-nowrap gap-4 items-end mb-6">
                    <input 
                        className="form-input flex-grow min-w-0" 
                        placeholder="Descripción del Ítem"
                        value={newItem.description} 
                        onChange={e => setNewItem({...newItem, description: e.target.value})} 
                    />
                    <input 
                        type="number" 
                        className="form-input w-24 text-right"
                        placeholder="Cantidad"
                        value={newItem.quantity} 
                        min="0" 
                        onChange={e => handleNewItemNumericChange('quantity', e.target.value)}
                    />
                    <input 
                        type="number" 
                        className="form-input w-32 text-right" 
                        placeholder="P. Unitario ($)" 
                        value={newItem.price} 
                        min="0" 
                        onChange={e => handleNewItemNumericChange('price', e.target.value)}
                    />
                    <button className="btn btn-secondary flex-shrink-0 cursor-pointer" onClick={handleAddItem}>Agregar</button>
                </div>
                
                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="p-3 text-left font-semibold">Descripción</th>
                                <th className="p-3 text-right font-semibold w-28">Cantidad</th>
                                <th className="p-3 text-right font-semibold w-36">P. Unitario</th>
                                <th className="p-3 text-right font-semibold w-36">Subtotal</th>
                                <th className="p-3 w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-gray-500 py-8">No hay ítems agregados.</td>
                                </tr>
                            ) : items.map((item, index) => (
                                <tr key={index} className="border-t dark:border-gray-700">
                                    <td className="p-2">
                                        <input type="text" className="form-input w-full bg-transparent border-0 focus:ring-0 px-1" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" className="form-input w-24 text-right bg-transparent border-0 focus:ring-0 px-1" value={item.quantity} min="0" onChange={e => handleItemChange(index, 'quantity', e.target.value)} />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" className="form-input w-32 text-right bg-transparent border-0 focus:ring-0 px-1" value={item.price} min="0" onChange={e => handleItemChange(index, 'price', e.target.value)} />
                                    </td>
                                    <td className="p-2 text-right font-medium align-middle w-36">{formatCurrency(item.quantity * item.price)}</td>
                                    <td className="p-2 text-center align-middle w-16">
                                        <button className="btn  btn-sm color-red hover:bg-red-600 cursor-pointer" onClick={() => handleDeleteItem(index)}>X</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-6 mb-6">
                    <div className="w-full max-w-sm space-y-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between"><span>Neto:</span><span className="font-medium">{formatCurrency(totals.neto)}</span></div>
                        <div className="flex justify-between"><span>IVA ({IVA_RATE * 100}%):</span><span className="font-medium">{formatCurrency(totals.iva)}</span></div>
                        <div className="flex justify-between font-bold text-lg border-t dark:border-gray-700 pt-2 mt-2"><span>TOTAL:</span><span>{formatCurrency(totals.total)}</span></div>
                    </div>
                </div>
                
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">3. Condiciones Comerciales</h2>
                <div>
                    <textarea className="form-input min-h-[80px]" rows={4} placeholder="Ej: Validez de la oferta: 15 días..." value={terms} onChange={e => setTerms(e.target.value)}></textarea>
                </div>

                <div className="mt-8">
                    {!isGenerating ? (
                        <button className="btn btn-primary w-full font-bold cursor-pointer" onClick={generatePdf}>Generar Presupuesto en PDF</button>
                    ) : (
                        <div className="text-center p-4">Generando PDF...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PresupuestoPage;