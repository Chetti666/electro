'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import {
    ArrowRight,
    Bug,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Heart,
    Lightbulb,
    MessageSquare,
    Share2,
    Sparkles,
    User,
    Users,
    Wrench,
} from 'lucide-react';

// Pilares del proyecto: gratis, sostenido por la comunidad y con adaptaciones a medida
const pillars = [
    {
        title: 'Herramientas de uso libre',
        description:
            'Todas las calculadoras, informes y planillas están disponibles sin registro, sin anuncios y sin límites de uso. No hay planes que comparar ni créditos que comprar.',
        points: ['Acceso completo desde el primer día', 'Pensadas para usarse en terreno, desde el móvil'],
        icon: Wrench,
        color: '#38bdf8',
    },
    {
        title: 'Sostenido por la comunidad',
        description:
            'El proyecto se mantiene con donaciones voluntarias y únicas. Quien puede aportar, aporta; quien no puede, usa las herramientas igual. Así de simple.',
        points: ['Donación única, sin suscripción', 'Cada aporte define qué se construye después'],
        icon: Heart,
        color: '#fb7185',
    },
    {
        title: 'Adaptaciones a medida',
        description:
            'No desarrollamos software complejo desde cero. Lo que hacemos es personalizar las herramientas que ya existen: formularios con tus datos, informes con tu marca y ajustes puntuales a tu forma de trabajar. Primero revisamos si es viable y después se cotiza.',
        points: ['Personalización de formularios y planillas existentes', 'Evaluamos la factibilidad antes de cotizar'],
        icon: Sparkles,
        color: '#fbbf24',
    },
];

// Formas concretas de participar en la comunidad
const communityActions = [
    {
        title: 'Úsalas en terreno',
        description: 'Cada cálculo real nos dice qué funciona y qué falta ajustar.',
        icon: Users,
    },
    {
        title: 'Cuéntanos qué te falta',
        description: 'Sugerencias de nuevas calculadoras, informes o planillas.',
        icon: Lightbulb,
    },
    {
        title: 'Reporta un error',
        description: 'Un resultado raro o un dato desactualizado se corrige rápido.',
        icon: Bug,
    },
    {
        title: 'Compártelas',
        description: 'Con un colega o en tu grupo de trabajo. Así llega a más gente.',
        icon: Share2,
    },
];

// Ejemplos de encargos personalizados
const customToolExamples = [
    'Informes y presupuestos con tu logo, membrete y firmas',
    'Formularios y planillas adaptados a los datos de tu empresa',
    'Campos y criterios propios en las calculadoras existentes',
    'Revisamos contigo si una herramienta más compleja es viable',
];

const teamMembers = [
    {
        name: 'Antonio Guiachetti',
        role: 'Ingeniero Metalúrgico / Desarrollador Full Stack',
        color: 'blue',
    },
    {
        name: 'Marcos Arriagada',
        role: 'Ingeniero Eléctrico / Desarrollador Front End',
        color: 'emerald',
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
        },
    },
};

export default function AboutUsPage() {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleReadMore = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="page-container">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mx-auto max-w-3xl text-center"
            >
                <span className="badge badge-primary mb-5 inline-flex items-center gap-2">
                    <Heart className="h-3.5 w-3.5" aria-hidden />
                    Sin planes de uso · Sin suscripciones · Sin anuncios
                </span>

                <h1 className="section-title text-balance text-3xl md:text-4xl">
                    Herramientas de apoyo para la comunidad eléctrica
                </h1>

                <p className="section-subtitle mx-auto" style={{ color: 'var(--foreground-muted)' }}>
                    VMElectric nace en terreno y crece con quienes lo usan. Calculadoras, informes
                    y planillas gratuitas, mantenidas por una comunidad que comparte su experiencia
                    para que las herramientas sean cada vez más útiles.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link href="/calculadoras" className="btn btn-primary">
                        Explorar herramientas
                        <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    <Link href="/donar" className="btn btn-secondary">
                        <Heart className="h-4 w-4" aria-hidden />
                        Apoyar el proyecto
                    </Link>
                </div>

                <p className="mt-4 text-xs" style={{ color: 'var(--foreground-dim)' }}>
                    ¿Necesitas adaptar alguna herramienta a tu forma de trabajar?{' '}
                    <Link
                        href="/contact"
                        className="underline transition-colors hover:text-primary-light"
                    >
                        Cuéntanos tu caso
                    </Link>
                    .
                </p>
            </motion.div>

            {/* Cómo se sostiene el modelo */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
                {pillars.map((pillar) => (
                    <motion.article
                        key={pillar.title}
                        variants={itemVariants}
                        className="card flex flex-col gap-4 p-6 lg:p-7"
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                                style={{
                                    background: `${pillar.color}18`,
                                    border: `1px solid ${pillar.color}40`,
                                    color: pillar.color,
                                }}
                            >
                                <pillar.icon className="h-5 w-5" aria-hidden />
                            </span>
                            <h2
                                className="text-lg font-semibold"
                                style={{
                                    fontFamily: 'var(--font-rajdhani)',
                                    letterSpacing: '0.4px',
                                    color: 'var(--foreground)',
                                }}
                            >
                                {pillar.title}
                            </h2>
                        </div>

                        <p
                            className="text-sm leading-relaxed"
                            style={{ color: 'var(--foreground-muted)' }}
                        >
                            {pillar.description}
                        </p>

                        <ul className="mt-auto space-y-2 pt-1">
                            {pillar.points.map((point) => (
                                <li
                                    key={point}
                                    className="flex items-start gap-2 text-sm"
                                    style={{ color: 'var(--foreground-muted)' }}
                                >
                                    <CheckCircle2
                                        className="mt-0.5 h-4 w-4 shrink-0"
                                        style={{ color: pillar.color }}
                                        aria-hidden
                                    />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </motion.article>
                ))}
            </motion.div>

            {/* Comunidad */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className="mt-16 grid items-stretch gap-6 lg:grid-cols-5"
            >
                <div className="card p-6 lg:col-span-3 lg:p-8">
                    <span className="badge badge-success mb-4 inline-flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" aria-hidden />
                        Comunidad
                    </span>
                    <h2 className="section-title mb-4 text-2xl md:text-3xl">
                        No vendemos planes: construimos con la gente que los usa
                    </h2>
                    <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--foreground-muted)' }}
                    >
                        La mayoría de las plataformas del rubro te ofrecen suscripciones mensuales,
                        créditos por documento o funciones bloqueadas. Nosotros hicimos lo contrario:
                        dejar las herramientas abiertas para que el técnico, el instalador y el
                        ingeniero las usen sin pensar en el costo.
                    </p>
                    <p
                        className="mt-4 text-sm leading-relaxed"
                        style={{ color: 'var(--foreground-muted)' }}
                    >
                        La comunidad es el motor del proyecto. Las mejoras salen de lo que pasa en
                        terreno: una normativa que cambió, un cálculo que no cuadraba, un informe
                        que costaba armar. Cada comentario, incluso el que llega junto a una
                        donación, entra a una lista de lo que viene después.
                    </p>
                </div>

                <div className="glass-panel lg:col-span-2">
                    <h3
                        className="mb-4 text-lg font-semibold"
                        style={{
                            fontFamily: 'var(--font-rajdhani)',
                            letterSpacing: '0.4px',
                            color: 'var(--foreground)',
                        }}
                    >
                        Cómo participar
                    </h3>
                    <ul className="space-y-4">
                        {communityActions.map((action) => (
                            <li key={action.title} className="flex items-start gap-3">
                                <span
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                    style={{
                                        background: 'rgba(37, 99, 235, 0.12)',
                                        border: '1px solid rgba(37, 99, 235, 0.28)',
                                        color: 'var(--primary-light)',
                                    }}
                                >
                                    <action.icon className="h-4 w-4" aria-hidden />
                                </span>
                                <div>
                                    <p
                                        className="text-sm font-semibold"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        {action.title}
                                    </p>
                                    <p
                                        className="mt-0.5 text-xs leading-relaxed"
                                        style={{ color: 'var(--foreground-dim)' }}
                                    >
                                        {action.description}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.section>

            {/* Donaciones / adaptaciones a medida */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className="mt-8 grid gap-6 md:grid-cols-2"
            >
                <div
                    className="rounded-xl p-6 lg:p-7"
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(251, 113, 133, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)',
                        border: '1px solid rgba(251, 113, 133, 0.3)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <span
                            className="flex h-11 w-11 items-center justify-center rounded-lg"
                            style={{
                                background: 'rgba(251, 113, 133, 0.16)',
                                border: '1px solid rgba(251, 113, 133, 0.35)',
                                color: '#fda4af',
                            }}
                        >
                            <Heart className="h-5 w-5 fill-current" aria-hidden />
                        </span>
                        <h2
                            className="text-lg font-semibold"
                            style={{
                                fontFamily: 'var(--font-rajdhani)',
                                letterSpacing: '0.4px',
                                color: 'var(--foreground)',
                            }}
                        >
                            Donaciones voluntarias
                        </h2>
                    </div>

                    <p
                        className="mt-4 text-sm leading-relaxed"
                        style={{ color: 'var(--foreground-muted)' }}
                    >
                        Si las herramientas te ahorran tiempo en terreno, puedes devolver una parte
                        con una donación única. No es una suscripción ni da acceso a nada extra:
                        simplemente mantiene el sitio en línea, la normativa al día y las mejoras
                        en marcha.
                    </p>

                    <ul className="mt-4 space-y-2">
                        {[
                            'Puedes donar sin crear una cuenta',
                            'Desde montos pequeños, una sola vez',
                            'Pago seguro con Flow y comprobante por correo',
                        ].map((item) => (
                            <li
                                key={item}
                                className="flex items-start gap-2 text-sm"
                                style={{ color: 'var(--foreground-muted)' }}
                            >
                                <CheckCircle2
                                    className="mt-0.5 h-4 w-4 shrink-0"
                                    style={{ color: '#fb7185' }}
                                    aria-hidden
                                />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <Link href="/donar" className="btn btn-primary mt-6 w-full sm:w-auto">
                        <Heart className="h-4 w-4" aria-hidden />
                        Hacer una donación
                    </Link>
                </div>

                <div
                    className="rounded-xl p-6 lg:p-7"
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(37, 99, 235, 0.08) 100%)',
                        border: '1px solid rgba(56, 189, 248, 0.28)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <span
                            className="flex h-11 w-11 items-center justify-center rounded-lg"
                            style={{
                                background: 'rgba(56, 189, 248, 0.14)',
                                border: '1px solid rgba(56, 189, 248, 0.32)',
                                color: '#7dd3fc',
                            }}
                        >
                            <Wrench className="h-5 w-5" aria-hidden />
                        </span>
                        <h2
                            className="text-lg font-semibold"
                            style={{
                                fontFamily: 'var(--font-rajdhani)',
                                letterSpacing: '0.4px',
                                color: 'var(--foreground)',
                            }}
                        >
                            Herramientas a medida
                        </h2>
                    </div>

                    <p
                        className="mt-4 text-sm leading-relaxed"
                        style={{ color: 'var(--foreground-muted)' }}
                    >
                        No hacemos software de alta complejidad. Lo que sí podemos hacer es
                        personalizar lo que ya está construido: agregar campos a un formulario,
                        ajustar un informe a tu identidad corporativa o adaptar una planilla a tus
                        criterios. Antes de cotizar, revisamos juntos si el cambio es factible y
                        tiene sentido para tu trabajo.
                    </p>

                    <ul className="mt-4 space-y-2">
                        {customToolExamples.map((item) => (
                            <li
                                key={item}
                                className="flex items-start gap-2 text-sm"
                                style={{ color: 'var(--foreground-muted)' }}
                            >
                                <CheckCircle2
                                    className="mt-0.5 h-4 w-4 shrink-0"
                                    style={{ color: '#38bdf8' }}
                                    aria-hidden
                                />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <Link href="/contact" className="btn btn-secondary mt-6 w-full sm:w-auto">
                        <MessageSquare className="h-4 w-4" aria-hidden />
                        Consultar una adaptación
                    </Link>
                </div>
            </motion.section>

            {/* Nuestra Historia */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className="card mt-16 space-y-6 p-6 lg:p-8"
            >
                <h2 className="border-b-2 border-blue-500 pb-3 text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
                    Nuestra Historia
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                    Nacimos de una pregunta simple: ¿Cómo podemos usar la tecnología para alivianar
                    la carga diaria de los técnicos e instaladores eléctricos?
                </p>

                <div
                    className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                    aria-hidden={!isExpanded}
                >
                    <div className="overflow-hidden">
                        <p
                            className="pt-2 text-sm leading-relaxed"
                            style={{ color: 'var(--foreground-muted)' }}
                        >
                            Conocemos las horas dedicadas a hacer cálculos en papel, el desafío de
                            crear informes detallados después de una larga jornada en terreno y la
                            complejidad de generar presupuestos precisos que ganen clientes. Vimos
                            una oportunidad de digitalizar esas tareas, no para complicarlas, sino
                            para hacerlas más rápidas, más fáciles y más eficientes.
                        </p>
                        <p
                            className="pt-4 text-sm leading-relaxed"
                            style={{ color: 'var(--foreground-muted)' }}
                        >
                            Desde el principio descartamos el modelo de planes y funciones
                            bloqueadas: nos parecía injusto cobrar por herramientas que deberían
                            estar al alcance de cualquiera que trabaje en terreno. En su lugar,
                            elegimos un camino más lento pero más honesto: dejar todo abierto,
                            escuchar a la comunidad y sostener el proyecto con donaciones
                            voluntarias y con la personalización de herramientas para empresas que
                            necesitan ajustarlas a su forma de trabajar.
                        </p>
                    </div>
                </div>

                <button
                    onClick={toggleReadMore}
                    className="btn btn-primary mt-auto self-start px-5 py-2 text-sm"
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? (
                        <>
                            Leer menos <ChevronUp className="h-4 w-4" aria-hidden />
                        </>
                    ) : (
                        <>
                            Leer más <ChevronDown className="h-4 w-4" aria-hidden />
                        </>
                    )}
                </button>
            </motion.div>

            {/* Equipo */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className="mt-16"
            >
                <div className="text-center">
                    <h2 className="section-title text-2xl md:text-3xl">Quiénes están detrás</h2>
                    <p
                        className="mx-auto max-w-2xl text-sm"
                        style={{ color: 'var(--foreground-muted)' }}
                    >
                        Un equipo pequeño de ingeniería que trabaja en terreno y programa lo que le
                        gustaría tener a mano.
                    </p>
                </div>

                <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
                    {teamMembers.map((member) => (
                        <div
                            key={member.name}
                            className="card flex flex-col items-center justify-center rounded-2xl p-8 text-center"
                        >
                            <div
                                className={`mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br shadow-lg ${member.color === 'blue'
                                    ? 'from-blue-400 to-blue-600'
                                    : 'from-emerald-400 to-emerald-600'
                                    }`}
                            >
                                <User className="h-12 w-12 text-white" aria-hidden />
                            </div>
                            <h3 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                                {member.name}
                            </h3>
                            <p
                                className="mt-1 font-medium"
                                style={{
                                    color: member.color === 'blue' ? 'var(--primary-light)' : '#34d399',
                                }}
                            >
                                {member.role}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* CTA final */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
                className="mt-16 rounded-2xl p-8 text-center lg:p-10"
                style={{
                    background:
                        'linear-gradient(135deg, rgba(37, 99, 235, 0.16) 0%, rgba(251, 113, 133, 0.12) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.28)',
                }}
            >
                <h2 className="section-title mb-3 text-2xl md:text-3xl">
                    Usa las herramientas. Si te sirven, apóyalas.
                </h2>
                <p
                    className="mx-auto max-w-xl text-sm leading-relaxed"
                    style={{ color: 'var(--foreground-muted)' }}
                >
                    No hay registro obligatorio, ni versión de prueba, ni botón de cancelar
                    suscripción. Solo un proyecto abierto que crece cuando la comunidad lo usa y
                    lo sostiene.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link href="/" className="btn btn-primary">
                        Ver las herramientas
                        <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    <Link href="/donar" className="btn btn-secondary">
                        <Heart className="h-4 w-4" aria-hidden />
                        Donar una vez
                    </Link>
                </div>
            </motion.section>
        </div>
    );
}
