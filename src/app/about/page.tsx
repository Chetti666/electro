'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { InfoCard } from '../../components/InfoCard';
import { ClipboardList, Eye, TrendingUp, User, ChevronDown, ChevronUp } from 'lucide-react';

// Datos del equipo actualizados
const teamMembers = [
    {
        name: 'Antonio Guiachetti',
        role: 'Ingeniero Metalúrgico / Desarrollador Full Stack',
        color: 'blue'
    },
    {
        name: 'Marcos Arriagada',
        role: 'Ingeniero Eléctrico / Desarrollador Front End',
        color: 'emerald'
    },
];

// Datos para las secciones de información
const infoSections = [
    {
        title: 'Nuestra Misión',
        icon: <ClipboardList className="w-6 h-6" />,
        iconBgClass: 'bg-blue-900/50',
        iconTextClass: 'text-blue-500',
        cardBorderClass: 'border-blue-500',
        content: 'Ser tu caja de herramientas digital. Creamos ElectroCalc para ofrecer soluciones prácticas que te ahorren tiempo y esfuerzo. Desde cálculos rápidos y generación de informes profesionales hasta la creación de presupuestos detallados desde tu móvil. No somos solo una app; somos tu compañero en el terreno.'
    },
    {
        title: 'Nuestra Visión',
        icon: <Eye className="w-6 h-6" />,
        iconBgClass: 'bg-emerald-900/50',
        iconTextClass: 'text-emerald-500',
        cardBorderClass: 'border-emerald-500',
        content: 'Creemos que la digitalización es la clave para el futuro del profesional eléctrico. Buscamos ser el puente que te permita adoptar la tecnología de forma sencilla. Queremos que ElectroCalc sea la herramienta estándar en la industria, ayudando a miles de técnicos a optimizar sus procesos y presentar una imagen más profesional.'
    },
    {
        title: 'Un Proyecto en Crecimiento',
        icon: <TrendingUp className="w-6 h-6" />,
        iconBgClass: 'bg-amber-900/50',
        iconTextClass: 'text-amber-500',
        cardBorderClass: 'border-amber-500',
        content: 'ElectroCalc es un proyecto que recién está comenzando. Nuestro compromiso es seguir creciendo y evolucionando junto a la comunidad. Esperamos en un futuro cercano incluir nuevas e innovadoras herramientas para seguir ayudando a más personas a simplificar su trabajo diario.'
    }
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

export default function AboutUsPage() {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleReadMore = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <section className="pt-24 pb-12 md:pt-32">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Acerca de Nosotros</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Conoce al equipo y la visión detrás de ElectroCalc.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {/* Tarjeta para "Nuestra Historia" */}
                    <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3 card rounded-lg p-6 lg:p-8 space-y-6 flex flex-col bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white border-b-2 border-blue-500 pb-3">Nuestra Historia</h3>
                        <p className="text-md leading-relaxed text-gray-600 dark:text-gray-300">
                            Nacimos de una pregunta simple: ¿Cómo podemos usar la tecnología para alivianar la carga diaria de los técnicos e instaladores eléctricos?
                        </p>

                        <div
                            className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                            aria-hidden={!isExpanded}
                        >
                            <div className="overflow-hidden">
                                <p className="text-md leading-relaxed text-gray-600 dark:text-gray-300 pt-2">
                                    Conocemos las horas dedicadas a hacer cálculos en papel, el desafío de crear informes detallados después de una larga jornada en terreno y la complejidad de generar presupuestos precisos que ganen clientes. Vimos una oportunidad de digitalizar esas tareas, no para complicarlas, sino para hacerlas más rápidas, más fáciles y más eficientes.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={toggleReadMore}
                            className="self-start mt-auto cursor-pointer rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-semibold shadow-md transition-all duration-300 flex items-center gap-2"
                            aria-expanded={isExpanded}
                        >
                            {isExpanded ? (
                                <>Leer menos <ChevronUp className="w-4 h-4" /></>
                            ) : (
                                <>Leer más <ChevronDown className="w-4 h-4" /></>
                            )}
                        </button>
                    </motion.div>

                    {/* Tarjetas de Misión, Visión, etc. */}
                    {infoSections.map((section) => (
                        <motion.div key={section.title} variants={itemVariants}>
                            <InfoCard {...section} isCard={true}>
                                {section.content}
                            </InfoCard>
                        </motion.div>
                    ))}

                    {/* Tarjetas del Equipo */}
                    {teamMembers.map((member) => (
                        <motion.div
                            key={member.name}
                            variants={itemVariants}
                            className="card rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center group"
                        >
                            <div className={`w-24 h-24 rounded-full mb-4 flex items-center justify-center bg-gradient-to-br ${member.color === 'blue' ? 'from-blue-400 to-blue-600' : 'from-emerald-400 to-emerald-600'
                                } shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <User className="w-12 h-12 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h4>
                            <p className={`font-medium ${member.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
                                }`}>{member.role}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
