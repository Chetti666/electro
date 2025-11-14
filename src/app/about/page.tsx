// Al usar hooks como useState, debemos marcarlo como un Componente de Cliente.
'use client';

import React, { useState } from 'react';
import Image from 'next/image'; // Importamos el componente Image de Next.js para optimización
import { InfoCard } from '../../components/InfoCard'; // Ruta corregida para encontrar el componente

// Datos del equipo para facilitar la iteración
const teamMembers = [
    {
        name: 'Ana García',
        role: 'CEO y Fundadora',
        imageUrl: '/images/team-ana.jpg', // Ruta a la imagen en la carpeta /public
    },
    {
        name: 'Carlos Rodriguez',
        role: 'Director de Tecnología (CTO)',
        imageUrl: '/images/team-carlos.jpg',
    },
    {
        name: 'Sofía López',
        role: 'Diseñadora Principal (UX/UI)',
        imageUrl: '/images/team-sofia.jpg',
    },
];

// Iconos como componentes o elementos para reutilizar
const ClipboardListIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const EyeIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const TrendingUpIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;

// Datos para las secciones de información
const infoSections = [
    {
        title: 'Nuestra Misión',
        icon: <ClipboardListIcon />,
        iconBgClass: 'bg-blue-900/50',
        iconTextClass: 'text-blue-500',
        cardBorderClass: 'border-blue-500',
        content: 'Ser tu caja de herramientas digital. Creamos ElectroCalc para ofrecer soluciones prácticas que te ahorren tiempo y esfuerzo. Desde cálculos rápidos y generación de informes profesionales hasta la creación de presupuestos detallados desde tu móvil. No somos solo una app; somos tu compañero en el terreno.'
    },
    {
        title: 'Nuestra Visión',
        icon: <EyeIcon />,
        iconBgClass: 'bg-emerald-900/50',
        iconTextClass: 'text-emerald-500',
        cardBorderClass: 'border-emerald-500',
        content: 'Creemos que la digitalización es la clave para el futuro del profesional eléctrico. Buscamos ser el puente que te permita adoptar la tecnología de forma sencilla. Queremos que ElectroCalc sea la herramienta estándar en la industria, ayudando a miles de técnicos a optimizar sus procesos y presentar una imagen más profesional.'
    },
    {
        title: 'Un Proyecto en Crecimiento',
        icon: <TrendingUpIcon />,
        iconBgClass: 'bg-amber-900/50',
        iconTextClass: 'text-amber-500',
        cardBorderClass: 'border-amber-500',
        content: 'ElectroCalc es un proyecto que recién está comenzando. Nuestro compromiso es seguir creciendo y evolucionando junto a la comunidad. Esperamos en un futuro cercano incluir nuevas e innovadoras herramientas para seguir ayudando a más personas a simplificar su trabajo diario.'
    }
];

export default function AboutUsPage() {
    // Estado para controlar si el texto adicional está expandido o no
    const [isExpanded, setIsExpanded] = useState(false);

    // Función para alternar el estado
    const toggleReadMore = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <section className="py-16 ">
            <div className="container mx-auto px-4">
               

                {/* Cuadrícula principal inspirada en la página de calculadoras */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Tarjeta para "Nuestra Historia" - Ocupa más espacio */}
                    <div className="md:col-span-2 lg:col-span-3 card rounded-lg p-6 lg:p-8 space-y-6 flex flex-col">
                        <h3 className="text-2xl font-semibold text-white border-b-2 border-blue-500 pb-3">Nuestra Historia</h3>
                        <p className="text-md leading-relaxed text-gray-300">
                            Nacimos de una pregunta simple: ¿Cómo podemos usar la tecnología para alivianar la carga diaria de los técnicos e instaladores eléctricos?
                        </p>
                        
                        {/* Contenido condicional con transición */}
                        <div
                            className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                            aria-hidden={!isExpanded}
                        >
                            <div className="overflow-hidden">
                                <p className="text-md leading-relaxed text-gray-300 pt-2">
                                Conocemos las horas dedicadas a hacer cálculos en papel, el desafío de crear informes detallados después de una larga jornada en terreno y la complejidad de generar presupuestos precisos que ganen clientes. Vimos una oportunidad de digitalizar esas tareas, no para complicarlas, sino para hacerlas más rápidas, más fáciles y más eficientes.
                                </p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={toggleReadMore} 
                            className="self-start mt-auto cursor-pointer rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
                            aria-expanded={isExpanded}
                        >
                            {isExpanded ? 'Leer menos' : 'Leer más'}
                        </button>
                    </div>

                    {/* Tarjetas de Misión, Visión, etc. */}
                    {infoSections.map((section) => (
                        <InfoCard key={section.title} {...section} isCard={true}>
                            {section.content}
                        </InfoCard>
                    ))}

                    {/* Tarjetas del Equipo */}
                    {teamMembers.map((member) => (
                        <div key={member.name} className="card rounded-lg text-center p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-gray-800/60 flex flex-col items-center justify-center">
                            <Image
                                src={member.imageUrl}
                                alt={`Foto de ${member.name}`}
                                width={120}
                                height={120}
                                className="rounded-full mx-auto mb-4 border-4 border-blue-500 object-cover"
                            />
                            <h4 className="text-xl font-semibold text-white">{member.name}</h4>
                            <p className="text-blue-500">{member.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
