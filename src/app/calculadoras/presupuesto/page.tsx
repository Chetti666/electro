"use client";
import React, { useState, useEffect, useMemo } from 'react';
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

interface Insumo {
    nombre: string;
    unidad: string;
    precio: number;
}

interface ApuItem extends Insumo {
    cantidad: number;
}

interface Apu {
    materiales: ApuItem[];
    manoDeObra: ApuItem[];
    equipos: ApuItem[];
}

interface PartidaMaestra {
    id: number;
    nombre: string;
    unidad: string;
    precioUnitario: number;
    costoDirecto: number;
    costosIndirectos: {
        porcHm: number;
        porcGg: number;
        porcUt: number;
    };
    desglose: Apu;
}

interface ApuCalculations {
    subtotalMateriales: number;
    subtotalManoDeObra: number;
    subtotalEquipos: number;
    costoDirecto: number;
    valorHm: number;
    valorGg: number;
    valorUt: number;
    precioUnitario: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

const PresupuestoPage = () => {
    const [yourInfo, setYourInfo] = useState({ name: '', rut: '', address: '', phone: '' });
    const [clientInfo, setClientInfo] = useState({ name: '', rut: '', address: '', phone: '' });
    const [quoteInfo, setQuoteInfo] = useState({
        number: '1',
        date: new Date().toISOString().split('T')[0],
        reference: ''
    });
    const [terms, setTerms] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [newItem, setNewItem] = useState<Item>({ description: '', quantity: 1, price: 0 });
    const [totals, setTotals] = useState({ neto: 0, iva: 0, total: 0 });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // --- APU States ---
    const [activeTab, setActiveTab] = useState('Cotizacion');
    const [activeSubTab, setActiveSubTab] = useState('Materiales');
    const [apuNombre, setApuNombre] = useState('');
    const [apuUnidad, setApuUnidad] = useState('');
    const [apuActual, setApuActual] = useState<Apu>({ materiales: [], manoDeObra: [], equipos: [] });
    const [dbMateriales, setDbMateriales] = useState<Insumo[]>([]);
    const [dbManoDeObra, setDbManoDeObra] = useState<Insumo[]>([]);
    const [dbEquipos, setDbEquipos] = useState<Insumo[]>([]);
    const [dbMaestroPartidas, setDbMaestroPartidas] = useState<PartidaMaestra[]>([]);
    const [apuPorcHm, setApuPorcHm] = useState(10);
    const [apuPorcGg, setApuPorcGg] = useState(15);
    const [apuPorcUt, setApuPorcUt] = useState(10);


    const IVA_RATE = 0.19;

    useEffect(() => {
        const neto = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const iva = neto * IVA_RATE;
        const total = neto + iva;
        setTotals({ neto, iva, total });
    }, [items]);

    // Load from localStorage on mount
    useEffect(() => {
        const loadFromStorage = <T,>(key: string, setter: React.Dispatch<React.SetStateAction<T>>, isArray = false) => {
            const data = localStorage.getItem(key);
            if (data) {
                setter(JSON.parse(data));
            } else if (isArray) {
                setter([] as unknown as T);
            }
        };
        
        loadFromStorage('presupuesto_yourInfo', setYourInfo);
        loadFromStorage('presupuesto_clientInfo', setClientInfo);
        loadFromStorage('presupuesto_quoteInfo', setQuoteInfo);
        loadFromStorage('presupuesto_terms', setTerms);
        loadFromStorage('presupuesto_items', setItems, true);
        loadFromStorage('apuMateriales', setDbMateriales, true);
        loadFromStorage('apuManoDeObra', setDbManoDeObra, true);
        loadFromStorage('apuEquipos', setDbEquipos, true);
        loadFromStorage('apuMaestroPartidas', setDbMaestroPartidas, true);

        setIsLoading(false);
    }, []);

    const handleAddItem = () => {
        if (newItem.description && newItem.quantity > 0) {
            setItems([...items, newItem]);
            setNewItem({ description: '', quantity: 1, price: 0 });
        }
    };

    const handleDeleteItem = (index: number) => {
        if (confirm(`¿Está seguro de que desea eliminar el ítem "${items[index].description}"?`)) {
            setItems(items.filter((_, i) => i !== index));
        }
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

    // --- APU Logic ---
    const apuCalculations = useMemo(() => {
        const subtotalMateriales = apuActual.materiales.reduce((sum, item) => sum + item.cantidad * item.precio, 0);
        const subtotalManoDeObra = apuActual.manoDeObra.reduce((sum, item) => sum + item.cantidad * item.precio, 0);
        const subtotalEquipos = apuActual.equipos.reduce((sum, item) => sum + item.cantidad * item.precio, 0);
        const costoDirecto = subtotalMateriales + subtotalManoDeObra + subtotalEquipos;

        const valorHm = subtotalManoDeObra * (apuPorcHm / 100);
        const valorGg = costoDirecto * (apuPorcGg / 100);
        const valorUt = costoDirecto * (apuPorcUt / 100);
        const precioUnitario = costoDirecto + valorHm + valorGg + valorUt;

        return {
            subtotalMateriales,
            subtotalManoDeObra,
            subtotalEquipos,
            costoDirecto,
            valorHm,
            valorGg,
            valorUt,
            precioUnitario
        };
    }, [apuActual, apuPorcHm, apuPorcGg, apuPorcUt]);

    const apuAgregarInsumo = (tipo: keyof Apu, db: Insumo[], selectId: string, cantidadId: string) => {
        const select = document.getElementById(selectId) as HTMLSelectElement;
        const cantidadInput = document.getElementById(cantidadId) as HTMLInputElement;
        const index = select.value;
        const cantidad = parseFloat(cantidadInput.value);

        if (index === "" || isNaN(cantidad) || cantidad <= 0) {
            alert("Seleccione un insumo y especifique una cantidad/rendimiento válido.");
            return;
        }

        const itemDB = db[parseInt(index)];
        setApuActual(prev => ({
            ...prev,
            [tipo]: [...prev[tipo], { ...itemDB, cantidad }]
        }));

        select.value = "";
        cantidadInput.value = "";
    };

    const apuEliminarItem = (tipo: keyof Apu, index: number) => {
        if (confirm("¿Eliminar este ítem del APU?")) {
            setApuActual(prev => ({
                ...prev,
                [tipo]: prev[tipo].filter((_, i) => i !== index)
            }));
        }
    };

    const limpiarAnalizador = (preguntar = true) => {
        const confirmar = preguntar ? confirm("¿Está seguro de que desea limpiar el analizador?") : true;
        if (confirmar) {
            setApuActual({ materiales: [], manoDeObra: [], equipos: [] });
            setApuNombre('');
            setApuUnidad('');
        }
    };

    const guardarPartidaActual = () => {
        if (!apuNombre || !apuUnidad) {
            alert("Error: Debe ingresar un Nombre y una Unidad para la partida.");
            return;
        }
        if (apuActual.materiales.length === 0 && apuActual.manoDeObra.length === 0 && apuActual.equipos.length === 0) {
            alert("Error: No puede guardar una partida vacía.");
            return;
        }

        const nuevaPartida: PartidaMaestra = {
            id: Date.now(),
            nombre: apuNombre,
            unidad: apuUnidad,
            precioUnitario: apuCalculations.precioUnitario,
            costoDirecto: apuCalculations.costoDirecto,
            costosIndirectos: { porcHm: apuPorcHm, porcGg: apuPorcGg, porcUt: apuPorcUt },
            desglose: JSON.parse(JSON.stringify(apuActual))
        };

        const updatedMaestro = [...dbMaestroPartidas, nuevaPartida];
        setDbMaestroPartidas(updatedMaestro);
        localStorage.setItem('apuMaestroPartidas', JSON.stringify(updatedMaestro));
        alert(`¡Partida "${apuNombre}" guardada con éxito!`);
        limpiarAnalizador(false);
    };

    const anadirApuACotizacion = () => {
        if (!apuNombre || apuCalculations.precioUnitario <= 0) {
            alert("Error: La partida debe tener un nombre y un precio unitario mayor a cero.");
            return;
        }
        const newItem: Item = { description: `${apuNombre} (${apuUnidad || 'S/U'})`, quantity: 1, price: apuCalculations.precioUnitario };
        setItems(prev => [...prev, newItem]);
        setActiveTab('Cotizacion');
        alert(`"${apuNombre}" añadido a la cotización. Puede ajustar la cantidad si es necesario.`);
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

    if (isLoading) {
        return <div className="container mx-auto px-4 py-8 text-center">Cargando...</div>;
    }

    return <PresupuestoPageContent
        yourInfo={yourInfo} setYourInfo={setYourInfo}
        clientInfo={clientInfo} setClientInfo={setClientInfo}
        quoteInfo={quoteInfo} setQuoteInfo={setQuoteInfo}
        terms={terms} setTerms={setTerms}
        items={items} setItems={setItems}
        newItem={newItem} setNewItem={setNewItem}
        totals={totals}
        isGenerating={isGenerating}
        generatePdf={generatePdf}
        handleAddItem={handleAddItem}
        handleDeleteItem={handleDeleteItem}
        handleNewItemNumericChange={handleNewItemNumericChange}
        handleItemChange={handleItemChange}
        dbMaestroPartidas={dbMaestroPartidas}
        IVA_RATE={IVA_RATE}
        activeTab={activeTab} setActiveTab={setActiveTab}
        activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab}
        apuNombre={apuNombre} setApuNombre={setApuNombre}
        apuUnidad={apuUnidad} setApuUnidad={setApuUnidad}
        apuActual={apuActual}
        apuCalculations={apuCalculations}
        apuPorcHm={apuPorcHm} setApuPorcHm={setApuPorcHm}
        apuPorcGg={apuPorcGg} setApuPorcGg={setApuPorcGg}
        apuPorcUt={apuPorcUt} setApuPorcUt={setApuPorcUt}
        dbMateriales={dbMateriales} setDbMateriales={setDbMateriales}
        dbManoDeObra={dbManoDeObra} setDbManoDeObra={setDbManoDeObra}
        dbEquipos={dbEquipos} setDbEquipos={setDbEquipos}
        setDbMaestroPartidas={setDbMaestroPartidas}
        apuAgregarInsumo={apuAgregarInsumo}
        apuEliminarItem={apuEliminarItem}
        limpiarAnalizador={limpiarAnalizador}
        guardarPartidaActual={guardarPartidaActual}
        anadirApuACotizacion={anadirApuACotizacion}
    />;
};

const DatabaseSection = <T extends Insumo>({ title, db, setDb, storageKey, formFields, tableHeaders }: { title: string; db: T[]; setDb: React.Dispatch<React.SetStateAction<T[]>>; storageKey: string; formFields: React.ReactNode; tableHeaders: string[] }) => {
    const handleDelete = (index: number) => {
        if (confirm(`¿Eliminar "${db[index].nombre}"?`)) {
            const newDb = db.filter((_, i) => i !== index);
            setDb(newDb);
            localStorage.setItem(storageKey, JSON.stringify(newDb));
        }
    };

    return (
        <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Ingresar Nuevo {title}</h2>
            {formFields}
            <h2 className="text-lg sm:text-xl font-semibold my-6 text-gray-900 dark:text-white">Base de Datos de {title}</h2>
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            {tableHeaders.map((h) => <th key={h} className="p-3 text-left font-semibold">{h}</th>)}
                            <th className="p-3 w-24 text-center font-semibold">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {db.length === 0 ? (
                            <tr><td colSpan={tableHeaders.length + 1} className="text-center text-gray-500 py-8">No hay {title.toLowerCase()} registrados.</td></tr>
                        ) : (
                            db.map((item, index) => (
                                <tr key={index} className="border-t dark:border-gray-700">
                                    <td className="p-2 align-middle">{item.nombre}</td>
                                    <td className="p-2 align-middle">{item.unidad}</td>
                                    <td className="p-2 align-middle">{formatCurrency(item.precio)}</td>
                                    <td className="p-2 align-middle"><button className="btn btn-sm bg-red-500 text-white hover:bg-red-600 cursor-pointer" onClick={() => handleDelete(index)}>Eliminar</button></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MaterialesDB = ({ db, setDb }: { db: Insumo[], setDb: React.Dispatch<React.SetStateAction<Insumo[]>> }) => {
    const [newMat, setNewMat] = useState({ nombre: '', unidadCompra: '', cantidadCompra: 1, unidadUso: 'c/u', precioCompra: 0, conIVA: false });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMat.nombre || newMat.cantidadCompra <= 0 || newMat.precioCompra <= 0) {
            alert("Por favor, complete todos los campos con valores válidos.");
            return;
        }
        const precioNeto = newMat.conIVA ? newMat.precioCompra / 1.19 : newMat.precioCompra;
        const precioUnitario = precioNeto / newMat.cantidadCompra;

        const newItem: Insumo = { nombre: newMat.nombre, unidad: newMat.unidadUso, precio: precioUnitario };
        const newDb = [...db, newItem];
        setDb(newDb);
        localStorage.setItem('apuMateriales', JSON.stringify(newDb));
        setNewMat({ nombre: '', unidadCompra: '', cantidadCompra: 1, unidadUso: 'c/u', precioCompra: 0, conIVA: false });
    };

    const formFields = (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="lg:col-span-3"><label className="form-label">Nombre</label><input className="form-input" value={newMat.nombre} onChange={e => setNewMat(p => ({ ...p, nombre: e.target.value }))} required /></div>
            <div><label className="form-label">Formato Compra</label><input className="form-input" value={newMat.unidadCompra} onChange={e => setNewMat(p => ({ ...p, unidadCompra: e.target.value }))} /></div>
            <div><label className="form-label">Cant. x Formato</label><input type="number" className="form-input" value={newMat.cantidadCompra} onChange={e => setNewMat(p => ({ ...p, cantidadCompra: parseFloat(e.target.value) || 1 }))} min="0.001" step="any" /></div>
            <div><label className="form-label">Unidad de Uso</label><select className="form-input" value={newMat.unidadUso} onChange={e => setNewMat(p => ({ ...p, unidadUso: e.target.value }))}><option value="m">m</option><option value="c/u">c/u</option><option value="m2">m2</option><option value="m3">m3</option><option value="kg">kg</option></select></div>
            <div><label className="form-label">Precio Formato ($)</label><input type="number" className="form-input" value={newMat.precioCompra} onChange={e => setNewMat(p => ({ ...p, precioCompra: parseFloat(e.target.value) || 0 }))} required /></div>
            <div className="flex items-center"><input type="checkbox" id="matIva" checked={newMat.conIVA} onChange={e => setNewMat(p => ({ ...p, conIVA: e.target.checked }))} className="mr-2" /><label htmlFor="matIva">Precio con IVA</label></div>
            <button type="submit" className="btn btn-secondary">Agregar Material</button>
        </form>
    );

    return <DatabaseSection title="Materiales" db={db} setDb={setDb} storageKey="apuMateriales" formFields={formFields} tableHeaders={['Nombre', 'Unidad Uso', 'Precio Unitario (Neto)']} />;
};

const ManoDeObraDB = ({ db, setDb }: { db: Insumo[], setDb: React.Dispatch<React.SetStateAction<Insumo[]>> }) => {
    const [newMO, setNewMO] = useState({ nombre: '', unidad: 'HH', precio: 0, conIVA: false });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMO.nombre || newMO.precio <= 0) {
            alert("Por favor, complete todos los campos con valores válidos.");
            return;
        }
        const precioNeto = newMO.conIVA ? newMO.precio / 1.19 : newMO.precio;
        const newItem: Insumo = { nombre: newMO.nombre, unidad: newMO.unidad, precio: precioNeto };
        const newDb = [...db, newItem];
        setDb(newDb);
        localStorage.setItem('apuManoDeObra', JSON.stringify(newDb));
        setNewMO({ nombre: '', unidad: 'HH', precio: 0, conIVA: false });
    };

    const formFields = (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div><label className="form-label">Cargo/Rol</label><input className="form-input" value={newMO.nombre} onChange={e => setNewMO(p => ({ ...p, nombre: e.target.value }))} required /></div>
            <div><label className="form-label">Unidad de Costo</label><select className="form-input" value={newMO.unidad} onChange={e => setNewMO(p => ({ ...p, unidad: e.target.value }))}><option value="HH">HH</option><option value="día">día</option><option value="mes">mes</option></select></div>
            <div><label className="form-label">Valor por Unidad ($)</label><input type="number" className="form-input" value={newMO.precio} onChange={e => setNewMO(p => ({ ...p, precio: parseFloat(e.target.value) || 0 }))} required /></div>
            <div className="flex items-center"><input type="checkbox" id="moIva" checked={newMO.conIVA} onChange={e => setNewMO(p => ({ ...p, conIVA: e.target.checked }))} className="mr-2" /><label htmlFor="moIva">Valor con IVA</label></div>
            <button type="submit" className="btn btn-secondary">Agregar Rol</button>
        </form>
    );

    return <DatabaseSection title="Mano de Obra" db={db} setDb={setDb} storageKey="apuManoDeObra" formFields={formFields} tableHeaders={['Cargo/Rol', 'Unidad', 'Valor Unitario (Neto)']} />;
};

const EquiposDB = ({ db, setDb }: { db: Insumo[], setDb: React.Dispatch<React.SetStateAction<Insumo[]>> }) => {
    const [newEq, setNewEq] = useState({ nombre: '', unidad: 'día', precio: 0, conIVA: false });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEq.nombre || newEq.precio <= 0) {
            alert("Por favor, complete todos los campos con valores válidos.");
            return;
        }
        const precioNeto = newEq.conIVA ? newEq.precio / 1.19 : newEq.precio;
        const newItem: Insumo = { nombre: newEq.nombre, unidad: newEq.unidad, precio: precioNeto };
        const newDb = [...db, newItem];
        setDb(newDb);
        localStorage.setItem('apuEquipos', JSON.stringify(newDb));
        setNewEq({ nombre: '', unidad: 'día', precio: 0, conIVA: false });
    };

    const formFields = (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div><label className="form-label">Nombre Equipo</label><input className="form-input" value={newEq.nombre} onChange={e => setNewEq(p => ({ ...p, nombre: e.target.value }))} required /></div>
            <div><label className="form-label">Unidad de Costo</label><select className="form-input" value={newEq.unidad} onChange={e => setNewEq(p => ({ ...p, unidad: e.target.value }))}><option value="día">día</option><option value="hr">hr</option><option value="mes">mes</option></select></div>
            <div><label className="form-label">Valor por Unidad ($)</label><input type="number" className="form-input" value={newEq.precio} onChange={e => setNewEq(p => ({ ...p, precio: parseFloat(e.target.value) || 0 }))} required /></div>
            <div className="flex items-center"><input type="checkbox" id="eqIva" checked={newEq.conIVA} onChange={e => setNewEq(p => ({ ...p, conIVA: e.target.checked }))} className="mr-2" /><label htmlFor="eqIva">Valor con IVA</label></div>
            <button type="submit" className="btn btn-secondary">Agregar Equipo</button>
        </form>
    );

    return <DatabaseSection title="Equipos" db={db} setDb={setDb} storageKey="apuEquipos" formFields={formFields} tableHeaders={['Nombre', 'Unidad', 'Precio Unitario (Neto)']} />;
};

const MaestroPartidas = ({ db, setDb }: { db: PartidaMaestra[], setDb: React.Dispatch<React.SetStateAction<PartidaMaestra[]>> }) => {
    const handleDelete = (index: number) => {
        if (confirm(`¿Eliminar la partida "${db[index].nombre}"?`)) {
            const newDb = db.filter((_, i) => i !== index);
            setDb(newDb);
            localStorage.setItem('apuMaestroPartidas', JSON.stringify(newDb));
        }
    };

    return (
        <div>
            <h2 className="text-lg sm:text-xl font-semibold my-6 text-gray-900 dark:text-white">Maestro de Partidas Guardadas</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Estas son las partidas (APUs) que has guardado desde el Analizador.</p>
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th className="p-3 text-left font-semibold w-2/3">Nombre de la Partida</th>
                            <th className="p-3 text-left font-semibold w-24">Unidad</th>
                            <th className="p-3 text-left font-semibold w-40">Precio Unitario (Neto)</th>
                            <th className="p-3 w-24 text-center font-semibold">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {db.length === 0 ? (
                            <tr><td colSpan={4} className="text-center text-gray-500 py-8">No hay partidas guardadas.</td></tr>
                        ) : (
                            db.map((partida, index) => (
                                <tr key={partida.id} className="border-t dark:border-gray-700">
                                    <td className="p-2 align-middle">{partida.nombre}</td>
                                    <td className="p-2 align-middle">{partida.unidad}</td>
                                    <td className="p-2 align-middle">{formatCurrency(partida.precioUnitario)}</td>
                                    <td className="p-2 text-center align-middle">
                                        <button className="btn btn-sm bg-red-500 text-white hover:bg-red-600 cursor-pointer" onClick={() => handleDelete(index)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface PresupuestoViewProps {
    yourInfo: { name: string; rut: string; address: string; phone: string; };
    setYourInfo: React.Dispatch<React.SetStateAction<{ name: string; rut: string; address: string; phone: string; }>>;
    clientInfo: { name: string; rut: string; address: string; phone: string; };
    setClientInfo: React.Dispatch<React.SetStateAction<{ name: string; rut: string; address: string; phone: string; }>>;
    quoteInfo: { number: string; date: string; reference: string; };
    setQuoteInfo: React.Dispatch<React.SetStateAction<{ number: string; date: string; reference: string; }>>;
    terms: string;
    setTerms: React.Dispatch<React.SetStateAction<string>>;
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    newItem: Item;
    setNewItem: React.Dispatch<React.SetStateAction<Item>>;
    totals: { neto: number; iva: number; total: number; };
    isGenerating: boolean;
    generatePdf: () => void;
    handleAddItem: () => void;
    handleDeleteItem: (index: number) => void;
    handleNewItemNumericChange: (field: 'quantity' | 'price', value: string) => void;
    handleItemChange: (index: number, field: keyof Item, value: string) => void;
    dbMaestroPartidas: PartidaMaestra[];
    IVA_RATE: number;
}

const PresupuestoView = ({
    yourInfo, setYourInfo, clientInfo, setClientInfo, quoteInfo, setQuoteInfo,
    terms, setTerms, items, newItem, setNewItem, totals, isGenerating,
    generatePdf, handleAddItem, handleDeleteItem, handleNewItemNumericChange,
    handleItemChange, dbMaestroPartidas, IVA_RATE
}: PresupuestoViewProps) => (
    <div className="card">
        <h2 className="text-lg sm:text-xl font-semibold mb-6 text-gray-900 dark:text-white">1. Información General</h2>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-6 p-4 border rounded-lg dark:border-gray-700">
            <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Tus Datos (Emisor)</h3>
                <div><label className="form-label mb-1">Nombre o Razón Social:</label><input className="form-input" value={yourInfo.name} onChange={e => setYourInfo({ ...yourInfo, name: e.target.value })} /></div>
                <div><label className="form-label mb-1">RUT:</label><input className="form-input" value={yourInfo.rut} onChange={e => setYourInfo({ ...yourInfo, rut: e.target.value })} /></div>
                <div><label className="form-label mb-1">Dirección:</label><input className="form-input" value={yourInfo.address} onChange={e => setYourInfo({ ...yourInfo, address: e.target.value })} /></div>
                <div><label className="form-label mb-1">Teléfono:</label><input className="form-input" value={yourInfo.phone} onChange={e => setYourInfo({ ...yourInfo, phone: e.target.value })} /></div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Datos del Cliente</h3>
                <div><label className="form-label mb-1">Nombre o Razón Social:</label><input className="form-input" value={clientInfo.name} onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })} /></div>
                <div><label className="form-label mb-1">RUT:</label><input className="form-input" value={clientInfo.rut} onChange={e => setClientInfo({ ...clientInfo, rut: e.target.value })} /></div>
                <div><label className="form-label mb-1">Dirección:</label><input className="form-input" value={clientInfo.address} onChange={e => setClientInfo({ ...clientInfo, address: e.target.value })} /></div>
                <div><label className="form-label mb-1">Teléfono:</label><input className="form-input" value={clientInfo.phone} onChange={e => setClientInfo({ ...clientInfo, phone: e.target.value })} /></div>
            </div>
        </div>

        <div className="space-y-4 mb-6">
            <div><label className="form-label mb-1">Referencia / Glosa:</label><input className="form-input" placeholder="Ej: Instalación eléctrica cocina Depto. 101" value={quoteInfo.reference} onChange={e => setQuoteInfo({ ...quoteInfo, reference: e.target.value })} /></div>
            <div className="grid md:grid-cols-2 gap-8">
                <div><label className="form-label mb-1">Nº Presupuesto:</label><input className="form-input" value={quoteInfo.number} onChange={e => setQuoteInfo({ ...quoteInfo, number: e.target.value })} /></div>
                <div><label className="form-label mb-1">Fecha:</label><input type="date" className="form-input" value={quoteInfo.date} onChange={e => setQuoteInfo({ ...quoteInfo, date: e.target.value })} /></div>
            </div>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">2. Ítems del Presupuesto</h2>
        <div className="flex flex-wrap gap-4 items-end mb-2">
            <input className="form-input flex-grow min-w-0" placeholder="Descripción del Ítem" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
            <input type="number" className="form-input w-full sm:w-24 text-right" placeholder="Cantidad" value={newItem.quantity} min="0" onChange={e => handleNewItemNumericChange('quantity', e.target.value)} />
            <input type="number" className="form-input w-full sm:w-32 text-right" placeholder="P. Unitario ($)" value={newItem.price} min="0" onChange={e => handleNewItemNumericChange('price', e.target.value)} />
            <button className="btn btn-secondary flex-shrink-0 w-full sm:w-auto cursor-pointer" onClick={handleAddItem}>Agregar</button>
        </div>
        <div className="flex flex-wrap gap-4 items-end mb-6">
            <select className="form-input flex-grow" onChange={e => {
                const partida = dbMaestroPartidas.find((p: PartidaMaestra) => p.id === Number(e.target.value));
                if (partida) {
                    setNewItem({ description: `${partida.nombre} (${partida.unidad})`, quantity: 1, price: Math.round(partida.precioUnitario) });
                }
            }}>
                <option value="">O cargar desde Maestro de Partidas...</option>
                {dbMaestroPartidas.map((p: PartidaMaestra) => <option key={p.id} value={p.id}>{p.nombre} - {formatCurrency(p.precioUnitario)}</option>)}
            </select>
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
                        <tr><td colSpan={5} className="text-center text-gray-500 py-8">No hay ítems agregados.</td></tr>
                    ) : items.map((item: Item, index: number) => (
                        <tr key={index} className="border-t dark:border-gray-700">
                            <td className="p-2"><input type="text" className="form-input w-full bg-transparent border-0 focus:ring-0 px-1" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} /></td>
                            <td className="p-2"><input type="number" className="form-input w-full text-right bg-transparent border-0 focus:ring-0 px-1" value={item.quantity} min="0" onChange={e => handleItemChange(index, 'quantity', e.target.value)} /></td>
                            <td className="p-2"><input type="number" className="form-input w-full text-right bg-transparent border-0 focus:ring-0 px-1" value={item.price} min="0" onChange={e => handleItemChange(index, 'price', e.target.value)} /></td>
                            <td className="p-2 text-right font-medium align-middle w-36">{formatCurrency(item.quantity * item.price)}</td>
                            <td className="p-2 text-center align-middle w-16"><button className="btn btn-sm bg-red-500 text-white hover:bg-red-600 cursor-pointer" onClick={() => handleDeleteItem(index)}>&#x2715;</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="flex justify-end mt-4 mb-6">
            <div className="w-full max-w-sm space-y-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-between"><span>Neto:</span><span className="font-medium">{formatCurrency(totals.neto)}</span></div>
                <div className="flex justify-between"><span>IVA ({IVA_RATE * 100}%):</span><span className="font-medium">{formatCurrency(totals.iva)}</span></div>
                <div className="flex justify-between font-bold text-lg border-t dark:border-gray-700 pt-2 mt-2"><span>TOTAL:</span><span>{formatCurrency(totals.total)}</span></div>
            </div>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">3. Condiciones Comerciales</h2>
        <div><textarea className="form-input min-h-[80px]" rows={4} placeholder="Ej: Validez de la oferta: 15 días..." value={terms} onChange={e => setTerms(e.target.value)}></textarea></div>

        <div className="mt-8">
            {!isGenerating ? (
                <button className="btn btn-primary w-full font-bold cursor-pointer" onClick={generatePdf}>Generar Presupuesto en PDF</button>
            ) : (
                <div className="text-center p-4">Generando PDF...</div>
            )}
        </div>
    </div>
);

interface ApuAnalizadorViewProps {
    apuNombre: string;
    setApuNombre: React.Dispatch<React.SetStateAction<string>>;
    apuUnidad: string;
    setApuUnidad: React.Dispatch<React.SetStateAction<string>>;
    apuActual: Apu;
    apuCalculations: ApuCalculations;
    apuPorcHm: number; 
    setApuPorcHm: React.Dispatch<React.SetStateAction<number>>;
    apuPorcGg: number;
    setApuPorcGg: React.Dispatch<React.SetStateAction<number>>;
    apuPorcUt: number;
    setApuPorcUt: React.Dispatch<React.SetStateAction<number>>;
    dbMateriales: Insumo[];
    dbManoDeObra: Insumo[];
    dbEquipos: Insumo[];
    apuAgregarInsumo: (tipo: keyof Apu, db: Insumo[], selectId: string, cantidadId: string) => void;
    apuEliminarItem: (tipo: keyof Apu, index: number) => void;
    limpiarAnalizador: (preguntar?: boolean) => void;
    guardarPartidaActual: () => void;
    anadirApuACotizacion: () => void;
}

const ApuAnalizadorView = ({ apuNombre, setApuNombre, apuUnidad, setApuUnidad, apuActual, apuCalculations, apuPorcHm, setApuPorcHm, apuPorcGg, setApuPorcGg, apuPorcUt, setApuPorcUt, dbMateriales, dbManoDeObra, dbEquipos, apuAgregarInsumo, apuEliminarItem, limpiarAnalizador, guardarPartidaActual, anadirApuACotizacion }: ApuAnalizadorViewProps) => {
    const renderApuTable = (title: string, items: ApuItem[], tipo: keyof Apu) => (
        <div className="mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h3>
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th className="p-2 text-left font-semibold">Insumo</th>
                            <th className="p-2 text-center font-semibold">Unidad</th>
                            <th className="p-2 text-right font-semibold">Cantidad/Rend.</th>
                            <th className="p-2 text-right font-semibold">Precio Unit.</th>
                            <th className="p-2 text-right font-semibold">Subtotal</th>
                            <th className="p-2 w-16"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={6} className="text-center text-gray-500 py-4">No hay insumos.</td></tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={index} className="border-t dark:border-gray-700">
                                    <td className="p-2">{item.nombre}</td>
                                    <td className="p-2 text-center">{item.unidad}</td>
                                    <td className="p-2 text-right">{item.cantidad.toFixed(3)}</td>
                                    <td className="p-2 text-right">{formatCurrency(item.precio)}</td>
                                    <td className="p-2 text-right font-medium">{formatCurrency(item.cantidad * item.precio)}</td>
                                    <td className="p-2 text-center"><button className="btn btn-sm bg-red-500 text-white hover:bg-red-600 cursor-pointer" onClick={() => apuEliminarItem(tipo, index)}>&#x2715;</button></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="card">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div><label className="form-label">Nombre de la Partida</label><input className="form-input" value={apuNombre} onChange={e => setApuNombre(e.target.value)} placeholder="Ej: Canalización PVC 20mm" /></div>
                <div><label className="form-label">Unidad</label><input className="form-input" value={apuUnidad} onChange={e => setApuUnidad(e.target.value)} placeholder="Ej: ml, un, m2" /></div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                    <label className="form-label">Materiales</label>
                    <select id="apu-select-mat" className="form-input"><option value="">Seleccionar...</option>{dbMateriales.map((insumo: Insumo, i: number) => <option key={i} value={i}>{insumo.nombre}</option>)}</select>
                    <input id="apu-cant-mat" type="number" className="form-input" placeholder="Cantidad" />
                    <button className="btn btn-secondary w-full" onClick={() => apuAgregarInsumo('materiales', dbMateriales, 'apu-select-mat', 'apu-cant-mat')}>+ Agregar Material</button>
                </div>
                <div className="space-y-2">
                    <label className="form-label">Mano de Obra</label>
                    <select id="apu-select-mo" className="form-input"><option value="">Seleccionar...</option>{dbManoDeObra.map((insumo: Insumo, i: number) => <option key={i} value={i}>{insumo.nombre}</option>)}</select>
                    <input id="apu-cant-mo" type="number" className="form-input" placeholder="Rendimiento (HH)" />
                    <button className="btn btn-secondary w-full" onClick={() => apuAgregarInsumo('manoDeObra', dbManoDeObra, 'apu-select-mo', 'apu-cant-mo')}>+ Agregar M.O.</button>
                </div>
                <div className="space-y-2">
                    <label className="form-label">Equipos y Herramientas</label>
                    <select id="apu-select-eq" className="form-input"><option value="">Seleccionar...</option>{dbEquipos.map((insumo: Insumo, i: number) => <option key={i} value={i}>{insumo.nombre}</option>)}</select>
                    <input id="apu-cant-eq" type="number" className="form-input" placeholder="Rendimiento (hr, día)" />
                    <button className="btn btn-secondary w-full" onClick={() => apuAgregarInsumo('equipos', dbEquipos, 'apu-select-eq', 'apu-cant-eq')}>+ Agregar Equipo</button>
                </div>
            </div>

            {renderApuTable("Materiales", apuActual.materiales, 'materiales')}
            {renderApuTable("Mano de Obra", apuActual.manoDeObra, 'manoDeObra')}
            {renderApuTable("Equipos y Herramientas", apuActual.equipos, 'equipos')}

            <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="p-4 border rounded-lg dark:border-gray-700 space-y-2">
                    <h3 className="font-semibold text-lg mb-2">Costos Indirectos (%)</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="form-label">Leyes Sociales (H.M.)</label><input type="number" className="form-input" value={apuPorcHm} onChange={e => setApuPorcHm(parseFloat(e.target.value) || 0)} /></div>
                        <div><label className="form-label">Gastos Generales (G.G.)</label><input type="number" className="form-input" value={apuPorcGg} onChange={e => setApuPorcGg(parseFloat(e.target.value) || 0)} /></div>
                        <div className="col-span-2"><label className="form-label">Utilidad (Ut.)</label><input type="number" className="form-input" value={apuPorcUt} onChange={e => setApuPorcUt(parseFloat(e.target.value) || 0)} /></div>
                    </div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-2">
                    <h3 className="font-semibold text-lg mb-2">Resumen del APU</h3>
                    <div className="flex justify-between"><span>Subtotal Materiales:</span><span className="font-medium">{formatCurrency(apuCalculations.subtotalMateriales)}</span></div>
                    <div className="flex justify-between"><span>Subtotal Mano de Obra:</span><span className="font-medium">{formatCurrency(apuCalculations.subtotalManoDeObra)}</span></div>
                    <div className="flex justify-between"><span>Subtotal Equipos:</span><span className="font-medium">{formatCurrency(apuCalculations.subtotalEquipos)}</span></div>
                    <div className="flex justify-between font-bold border-t dark:border-gray-700 pt-1 mt-1"><span>Costo Directo (C.D.):</span><span>{formatCurrency(apuCalculations.costoDirecto)}</span></div>
                    <div className="flex justify-between text-sm"><span>+ Leyes Sociales ({apuPorcHm}%):</span><span>{formatCurrency(apuCalculations.valorHm)}</span></div>
                    <div className="flex justify-between text-sm"><span>+ Gastos Generales ({apuPorcGg}%):</span><span>{formatCurrency(apuCalculations.valorGg)}</span></div>
                    <div className="flex justify-between text-sm"><span>+ Utilidad ({apuPorcUt}%):</span><span>{formatCurrency(apuCalculations.valorUt)}</span></div>
                    <div className="flex justify-between font-bold text-xl border-t-2 dark:border-gray-600 pt-2 mt-2"><span>Precio Unitario (P.U.):</span><span>{formatCurrency(apuCalculations.precioUnitario)}</span></div>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-8 justify-end">
                <button className="btn btn-accent" onClick={() => limpiarAnalizador()}>Limpiar Analizador</button>
                <button className="btn btn-secondary" onClick={guardarPartidaActual}>Guardar Partida</button>
                <button className="btn btn-primary" onClick={anadirApuACotizacion}>Añadir a Cotización</button>
            </div>
        </div>
    );
};

interface DatabaseViewProps {
    activeSubTab: string;
    setActiveSubTab: React.Dispatch<React.SetStateAction<string>>;
    dbMateriales: Insumo[];
    setDbMateriales: React.Dispatch<React.SetStateAction<Insumo[]>>;
    dbManoDeObra: Insumo[];
    setDbManoDeObra: React.Dispatch<React.SetStateAction<Insumo[]>>;
    dbEquipos: Insumo[];
    setDbEquipos: React.Dispatch<React.SetStateAction<Insumo[]>>;
    dbMaestroPartidas: PartidaMaestra[];
    setDbMaestroPartidas: React.Dispatch<React.SetStateAction<PartidaMaestra[]>>;
}
const DatabaseView = ({ activeSubTab, setActiveSubTab, dbMateriales, setDbMateriales, dbManoDeObra, setDbManoDeObra, dbEquipos, setDbEquipos, dbMaestroPartidas, setDbMaestroPartidas }: DatabaseViewProps) => (
    <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto" aria-label="Sub-tabs">
                <button onClick={() => setActiveSubTab('Materiales')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeSubTab === 'Materiales' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Materiales</button>
                <button onClick={() => setActiveSubTab('ManoDeObra')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeSubTab === 'ManoDeObra' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Mano de Obra</button>
                <button onClick={() => setActiveSubTab('Equipos')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeSubTab === 'Equipos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Equipos</button>
                <button onClick={() => setActiveSubTab('Maestro')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeSubTab === 'Maestro' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Maestro de Partidas</button>
            </nav>
        </div>
        <div>
            {activeSubTab === 'Materiales' && <MaterialesDB db={dbMateriales} setDb={setDbMateriales} />}
            {activeSubTab === 'ManoDeObra' && <ManoDeObraDB db={dbManoDeObra} setDb={setDbManoDeObra} />}
            {activeSubTab === 'Equipos' && <EquiposDB db={dbEquipos} setDb={setDbEquipos} />}
            {activeSubTab === 'Maestro' && <MaestroPartidas db={dbMaestroPartidas} setDb={setDbMaestroPartidas} />}
        </div>
    </div>
);

const PresupuestoPageContent = (props: any) => {
    return (
         <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Análisis de Precios Unitarios y Presupuestos</h1>
                <p className="text-gray-600 dark:text-gray-400">Crea APU, gestiona bases de datos y genera cotizaciones en PDF.</p>
                <br />
                <Link href="/calculadoras" className="text-amber-500 hover:text-amber-600 inline-flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a calculadoras
                </Link>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => props.setActiveTab('Cotizacion')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${props.activeTab === 'Cotizacion' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
                        Cotización
                    </button>
                    <button onClick={() => props.setActiveTab('Analizador')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${props.activeTab === 'Analizador' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
                        Analizador de APU
                    </button>
                    <button onClick={() => props.setActiveTab('Database')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${props.activeTab === 'Database' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>
                        Bases de Datos
                    </button>
                </nav>
            </div>

            {props.activeTab === 'Cotizacion' && <PresupuestoView {...props} />}
            {props.activeTab === 'Analizador' && <ApuAnalizadorView {...props} />}
            {props.activeTab === 'Database' && <DatabaseView {...props} />}
        </div>
    );
};

export default PresupuestoPage;