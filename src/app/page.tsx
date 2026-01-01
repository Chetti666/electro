'use client';

import React, { useRef } from 'react';
import Link from "next/link";
import dynamic from 'next/dynamic';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion, Variants } from "framer-motion";
import CalculadoraCard, { ColorType as CalculadoraColor } from '@/components/CalculadoraCard';
import InformeCard, { ColorType as InformeColor } from '@/components/InformeCard';
import { Calculator, FileText, BarChart3, Zap, Activity, Camera, ClipboardCheck, Search, Loader2 } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';

// --- Datos ---

const SampleDocumentsViewer = dynamic(
  () => import('@/components/SampleDocumentsViewer'),
  { ssr: false, loading: () => <div className="h-[788px] w-full bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center"><Loader2 className="h-12 w-12 text-blue-500 animate-spin" /></div> }
);

type Calculadora = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: CalculadoraColor;
};

type Informe = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: InformeColor;
};

const calculadoras: Calculadora[] = [
  {
    id: 'seccion',
    title: 'Cálculo de Sección de Conductores',
    description: 'Calcula la sección minima del conductor. Determina la sección necesaria para limitar la Caída de Tensión y asegurar el voltaje correcto.',
    icon: <Zap className="h-6 w-6" />,
    color: 'blue'
  },
  {
    id: 'caida-tension',
    title: 'Cálculo de Caída de Tensión',
    description: 'Determina el porcentaje de pérdida de voltaje en un conductor. Esencial para verificar el cumplimiento normativo.',
    icon: <Activity className="h-6 w-6" />,
    color: 'emerald'
  },
  {
    id: 'seccion-ric',
    title: 'Corriente Admisible por RIC',
    description: 'Determina la máxima corriente segura según características del conductor y normativa chilena RIC.',
    icon: <ShieldCheckIcon className="h-6 w-6" />,
    color: 'amber'
  },
  {
    id: 'empalmes',
    title: 'Buscador Normativo de Empalmes',
    description: 'Consulta rápida para seleccionar el empalme eléctrico ideal según normativa vigente.',
    icon: <Search className="h-6 w-6" />,
    color: 'red'
  },
  {
    id: 'calculadora-corriente',
    title: 'Cálculo General de Corriente',
    description: 'Calcula la corriente eléctrica (Amperes) necesaria utilizando potencia, voltaje y factor de potencia.',
    icon: <Calculator className="h-6 w-6" />,
    color: 'purple'
  },
  {
    id: 'rotuladora',
    title: 'Generador de Rótulos',
    description: 'Crea rótulos personalizados para tableros eléctricos. Descarga o imprime en PDF.',
    icon: <ClipboardCheck className="h-6 w-6" />,
    color: 'green'
  },
];

const informes: Informe[] = [
  {
    id: 'informe-resistividad',
    title: 'Informe de Resistividad',
    description: 'Registra y visualiza la curva SEV. Genera informe de medición de resistividad para puesta a tierra.',
    icon: <Activity className="h-6 w-6" />,
    color: 'green'
  },
  {
    id: 'presupuesto',
    title: 'Generador de Presupuestos',
    description: 'Crea presupuestos detallados y profesionales. Exporta a PDF para compartir con clientes.',
    icon: <FileText className="h-6 w-6" />,
    color: 'green'
  },
  {
    id: 'informe-fotografico',
    title: 'Informe Fotográfico RIC N°18',
    description: 'Genera el documento bajo los requisitos del Pliego Técnico Normativo RIC N°18.',
    icon: <Camera className="h-6 w-6" />,
    color: 'green'
  },
  {
    id: 'informe-inspeccion',
    title: 'Informe de Inspección',
    description: 'Levantamiento de instalaciones existentes. Detalla puntos críticos y recomendaciones.',
    icon: <Search className="h-6 w-6" />,
    color: 'green'
  }
];

// Icono auxiliar
function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

// --- Componentes de Animación ---

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

export default function Home() {
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <>
      {/* Hero Section con Carrusel */}
      <section className="relative pt-20 pb-8 md:pt-28 md:pb-12 overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white dark:from-blue-950 dark:via-gray-950 dark:to-gray-950 opacity-70"></div>

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
              Herramientas Eléctricas <span className="text-blue-600 dark:text-blue-400">Profesionales</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Potencia tu trabajo en terreno. Desde cálculos de sección hasta informes normativos detallados, todo en una sola plataforma moderna.
            </p>
          </motion.div>

          <Carousel
            plugins={[plugin.current]}
            className="w-full max-w-5xl mx-auto"
            opts={{ loop: true, align: 'center' }}
          >
            <CarouselContent className="-ml-4">
              {/* Slide 1: Calculadoras */}
              <CarouselItem className="pl-4 md:basis-1/1 lg:basis-1/1">
                <div className="p-1">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-2xl h-[400px] flex flex-col justify-center items-center text-center p-8 md:p-12">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-[2px] z-0"></div>
                    <div className="relative z-10 max-w-2xl">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm"
                      >
                        <Calculator className="h-10 w-10 text-white" />
                      </motion.div>
                      <h3 className="text-3xl sm:text-4xl font-bold mb-4">Calculadoras Precisas</h3>
                      <p className="text-lg sm:text-xl text-blue-100 mb-8">
                        Realiza cálculos complejos de forma rápida. Sección de conductores, caída de tensión y más, cumpliendo normativa RIC.
                      </p>
                      <Link 
                        href="/calculadoras" 
                        onClick={() => sendGAEvent({ event: 'click_cta', value: 'hero_calculadoras' })}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-blue-700 bg-white rounded-full hover:bg-blue-50 transition-colors shadow-lg"
                      >
                        Explorar Calculadoras
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 2: Informes */}
              <CarouselItem className="pl-4 md:basis-1/1 lg:basis-1/1">
                <div className="p-1">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-2xl h-[400px] flex flex-col justify-center items-center text-center p-8 md:p-12">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-[2px] z-0"></div>
                    <div className="relative z-10 max-w-2xl">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm"
                      >
                        <FileText className="h-10 w-10 text-white" />
                      </motion.div>
                      <h3 className="text-3xl sm:text-4xl font-bold mb-4">Informes Profesionales</h3>
                      <p className="text-lg sm:text-xl text-emerald-100 mb-8">
                        Genera informes de Sondeos Eléctricos Verticales (SEV) y fotográficos. Exporta a PDF listos para entregar.
                      </p>
                      <Link 
                        href="/informes" 
                        onClick={() => sendGAEvent({ event: 'click_cta', value: 'hero_informes' })}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-emerald-700 bg-white rounded-full hover:bg-emerald-50 transition-colors shadow-lg"
                      >
                        Explorar Informes
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 3: Gráficos */}
              <CarouselItem className="pl-4 md:basis-1/1 lg:basis-1/1">
                <div className="p-1">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-2xl h-[400px] flex flex-col justify-center items-center text-center p-8 md:p-12">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-[2px] z-0"></div>
                    <div className="relative z-10 max-w-2xl">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm"
                      >
                        <BarChart3 className="h-10 w-10 text-white" />
                      </motion.div>
                      <h3 className="text-3xl sm:text-4xl font-bold mb-4">Visualización de Datos</h3>
                      <p className="text-lg sm:text-xl text-amber-100 mb-8">
                        Interpreta tus mediciones con gráficos interactivos. Visualiza curvas de campo para un análisis preciso.
                      </p>
                      <Link 
                        href="/calculadoras" 
                        onClick={() => sendGAEvent({ event: 'click_cta', value: 'hero_graficos' })}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-amber-700 bg-white rounded-full hover:bg-amber-50 transition-colors shadow-lg"
                      >
                        Ver Herramientas
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* Calculadoras Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Calculadoras Disponibles
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Herramientas especializadas para realizar tus cálculos eléctricos de manera precisa y eficiente.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {calculadoras.map((calc) => (
              <motion.div key={calc.id} variants={itemVariants}>
                <CalculadoraCard {...calc} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Informes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Informes Disponibles
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Genera documentos eléctricos profesionales y detallados de manera rápida y sencilla.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {informes.map((informe) => (
              <motion.div key={informe.id} variants={itemVariants}>
                <InformeCard {...informe} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sample Documents Section */}
      <SampleDocumentsViewer />
    </>
  );
}