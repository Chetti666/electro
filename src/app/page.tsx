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

const SampleDocumentsViewer = dynamic(
  () => import('@/components/SampleDocumentsViewer'),
  { ssr: false, loading: () => <div className="h-[788px] w-full flex items-center justify-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}><Loader2 className="h-12 w-12 animate-spin text-primary-light" /></div> }
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
      <section className="relative pt-20 pb-8 md:pt-28 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 60%)'
        }}></div>

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-8"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-balance"
              style={{ color: 'var(--foreground)' }}
            >
              Herramientas Eléctricas{' '}
              <span style={{ color: 'var(--primary-light)' }}>Profesionales</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
              Potencia tu trabajo en terreno. Desde cálculos de sección hasta informes normativos detallados, todo en una sola plataforma moderna.
            </p>
          </motion.div>

          <Carousel
            plugins={[plugin.current]}
            className="w-full max-w-5xl mx-auto"
            opts={{ loop: true, align: 'center' }}
          >
            <CarouselContent className="-ml-4">
              <CarouselItem className="pl-4 md:basis-1/1 lg:basis-1/1">
                <div className="p-1">
                  <div
                    className="relative overflow-hidden rounded-2xl h-[400px] flex flex-col justify-center items-center text-center p-8 md:p-12"
                    style={{
                      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(14, 165, 233, 0.05) 50%, rgba(37, 99, 235, 0.1) 100%)',
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <div className="relative z-10 max-w-2xl">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-20 w-20 rounded-xl flex items-center justify-center mb-6 mx-auto"
                        style={{
                          background: 'rgba(37, 99, 235, 0.1)',
                          border: '1px solid rgba(37, 99, 235, 0.3)',
                        }}
                      >
                        <Calculator className="h-10 w-10 text-primary-light" />
                      </motion.div>
                      <h3 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Calculadoras Precisas</h3>
                      <p className="text-lg sm:text-xl mb-8" style={{ color: 'var(--foreground-muted)' }}>
                        Realiza cálculos complejos de forma rápida. Sección de conductores, caída de tensión y más, cumpliendo normativa RIC.
                      </p>
                      <Link
                        href="/calculadoras"
                        onClick={() => sendGAEvent({ event: 'click_cta', value: 'hero_calculadoras' })}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold rounded-lg transition-all"
                        style={{
                          background: 'var(--primary)',
                          border: '1px solid var(--primary)',
                          color: '#fff',
                        }}
                      >
                        Explorar Calculadoras
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="pl-4 md:basis-1/1 lg:basis-1/1">
                <div className="p-1">
                  <div
                    className="relative overflow-hidden rounded-2xl h-[400px] flex flex-col justify-center items-center text-center p-8 md:p-12"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(37, 99, 235, 0.05) 50%, rgba(16, 185, 129, 0.1) 100%)',
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <div className="relative z-10 max-w-2xl">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-20 w-20 rounded-xl flex items-center justify-center mb-6 mx-auto"
                        style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <FileText className="h-10 w-10" style={{ color: '#10b981' }} />
                      </motion.div>
                      <h3 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Informes Profesionales</h3>
                      <p className="text-lg sm:text-xl mb-8" style={{ color: 'var(--foreground-muted)' }}>
                        Genera informes de Sondeos Eléctricos Verticales (SEV) y fotográficos. Exporta a PDF listos para entregar.
                      </p>
                      <Link
                        href="/informes"
                        onClick={() => sendGAEvent({ event: 'click_cta', value: 'hero_informes' })}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold rounded-lg transition-all"
                        style={{
                          background: '#10b981',
                          border: '1px solid #10b981',
                          color: '#fff',
                        }}
                      >
                        Explorar Informes
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              <CarouselItem className="pl-4 md:basis-1/1 lg:basis-1/1">
                <div className="p-1">
                  <div
                    className="relative overflow-hidden rounded-2xl h-[400px] flex flex-col justify-center items-center text-center p-8 md:p-12"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(37, 99, 235, 0.05) 50%, rgba(245, 158, 11, 0.1) 100%)',
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <div className="relative z-10 max-w-2xl">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-20 w-20 rounded-xl flex items-center justify-center mb-6 mx-auto"
                        style={{
                          background: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                        }}
                      >
                        <BarChart3 className="h-10 w-10" style={{ color: '#f59e0b' }} />
                      </motion.div>
                      <h3 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Visualización de Datos</h3>
                      <p className="text-lg sm:text-xl mb-8" style={{ color: 'var(--foreground-muted)' }}>
                        Interpreta tus mediciones con gráficos interactivos. Visualiza curvas de campo para un análisis preciso.
                      </p>
                      <Link
                        href="/calculadoras"
                        onClick={() => sendGAEvent({ event: 'click_cta', value: 'hero_graficos' })}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold rounded-lg transition-all"
                        style={{
                          background: '#f59e0b',
                          border: '1px solid #f59e0b',
                          color: '#fff',
                        }}
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

      <section className="py-16" style={{ background: 'var(--background-secondary)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="section-title">
              Calculadoras Disponibles
            </h2>
            <p className="section-subtitle">
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

      <section className="py-16" style={{ background: 'var(--background)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="section-title">
              Informes Disponibles
            </h2>
            <p className="section-subtitle">
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

      <SampleDocumentsViewer />
    </>
  );
}
