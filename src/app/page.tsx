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
  { ssr: false, loading: () => <div className="h-[788px] w-full flex items-center justify-center" style={{ background: 'rgba(3, 7, 18, 0.5)', border: '1px solid rgba(0, 255, 255, 0.2)' }}><Loader2 className="h-12 w-12 animate-spin" style={{ color: '#00ffff', filter: 'drop-shadow(0 0 10px #00ffff)' }} /></div> }
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
      <section className="relative pt-20 pb-8 md:pt-28 md:pb-12 overflow-hidden grid-bg">
        <div className="absolute inset-0 -z-10" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 128, 255, 0.15) 0%, transparent 60%)'
        }}></div>
        
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-8"
          >
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
              style={{
                fontFamily: 'var(--font-orbitron)',
                color: '#fff',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.2), 0 0 80px rgba(0, 255, 255, 0.1)'
              }}
            >
              Herramientas Eléctricas <span style={{ color: '#00ffff', textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff' }}>Profesionales</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(226, 232, 240, 0.8)' }}>
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
                      background: 'linear-gradient(135deg, rgba(0, 128, 255, 0.2) 0%, rgba(0, 255, 255, 0.1) 50%, rgba(0, 128, 255, 0.2) 100%)',
                      border: '1px solid rgba(0, 255, 255, 0.3)',
                      boxShadow: '0 0 30px rgba(0, 255, 255, 0.2), inset 0 0 50px rgba(0, 255, 255, 0.05)'
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, #00ffff, transparent)', boxShadow: '0 0 20px #00ffff' }} />
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
                    }} />
                    <div className="relative z-10 max-w-2xl">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-20 w-20 rounded-full flex items-center justify-center mb-6 mx-auto"
                        style={{
                          background: 'rgba(0, 255, 255, 0.1)',
                          border: '2px solid rgba(0, 255, 255, 0.5)',
                          boxShadow: '0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)'
                        }}
                      >
                        <Calculator className="h-10 w-10" style={{ color: '#00ffff', filter: 'drop-shadow(0 0 10px #00ffff)' }} />
                      </motion.div>
                      <h3 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-orbitron)', color: '#fff', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>Calculadoras Precisas</h3>
                      <p className="text-lg sm:text-xl mb-8" style={{ color: 'rgba(226, 232, 240, 0.8)' }}>
                        Realiza cálculos complejos de forma rápida. Sección de conductores, caída de tensión y más, cumpliendo normativa RIC.
                      </p>
                      <Link 
                        href="/calculadoras" 
                        onClick={() => sendGAEvent({ event: 'click_cta', value: 'hero_calculadoras' })}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-full transition-all"
                        style={{
                          fontFamily: 'var(--font-orbitron)',
                          background: 'transparent',
                          border: '2px solid #00ffff',
                          color: '#00ffff',
                          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1)',
                          textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
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
                      background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.2) 0%, rgba(255, 0, 128, 0.1) 50%, rgba(255, 0, 255, 0.2) 100%)',
                      border: '1px solid rgba(255, 0, 255, 0.3)',
                      boxShadow: '0 0 30px rgba(255, 0, 255, 0.2), inset 0 0 50px rgba(255, 0, 255, 0.05)'
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, #ff00ff, transparent)', boxShadow: '0 0 20px #ff00ff' }} />
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                      background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 255, 0.03) 2px, rgba(255, 0, 255, 0.03) 4px)'
                    }} />
                    <div className="relative z-10 max-w-2xl">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-20 w-20 rounded-full flex items-center justify-center mb-6 mx-auto"
                        style={{
                          background: 'rgba(255, 0, 255, 0.1)',
                          border: '2px solid rgba(255, 0, 255, 0.5)',
                          boxShadow: '0 0 30px rgba(255, 0, 255, 0.3), inset 0 0 20px rgba(255, 0, 255, 0.1)'
                        }}
                      >
                        <FileText className="h-10 w-10" style={{ color: '#ff00ff', filter: 'drop-shadow(0 0 10px #ff00ff)' }} />
                      </motion.div>
                      <h3 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-orbitron)', color: '#fff', textShadow: '0 0 10px rgba(255, 0, 255, 0.5)' }}>Informes Profesionales</h3>
                      <p className="text-lg sm:text-xl mb-8" style={{ color: 'rgba(226, 232, 240, 0.8)' }}>
                        Genera informes de Sondeos Eléctricos Verticales (SEV) y fotográficos. Exporta a PDF listos para entregar.
                      </p>
                      <Link 
                        href="/informes" 
                        onClick={() => sendGAEvent({ event: 'click_cta', value: 'hero_informes' })}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-full transition-all"
                        style={{
                          fontFamily: 'var(--font-orbitron)',
                          background: 'transparent',
                          border: '2px solid #ff00ff',
                          color: '#ff00ff',
                          boxShadow: '0 0 20px rgba(255, 0, 255, 0.3), inset 0 0 10px rgba(255, 0, 255, 0.1)',
                          textShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
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
                      background: 'linear-gradient(135deg, rgba(255, 128, 0, 0.2) 0%, rgba(255, 255, 0, 0.1) 50%, rgba(255, 128, 0, 0.2) 100%)',
                      border: '1px solid rgba(255, 200, 0, 0.3)',
                      boxShadow: '0 0 30px rgba(255, 200, 0, 0.2), inset 0 0 50px rgba(255, 200, 0, 0.05)'
                    }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, #ffff00, transparent)', boxShadow: '0 0 20px #ffff00' }} />
                    <div className="relative z-10 max-w-2xl">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-20 w-20 rounded-full flex items-center justify-center mb-6 mx-auto"
                        style={{
                          background: 'rgba(255, 255, 0, 0.1)',
                          border: '2px solid rgba(255, 255, 0, 0.5)',
                          boxShadow: '0 0 30px rgba(255, 255, 0, 0.3), inset 0 0 20px rgba(255, 255, 0, 0.1)'
                        }}
                      >
                        <BarChart3 className="h-10 w-10" style={{ color: '#ffff00', filter: 'drop-shadow(0 0 10px #ffff00)' }} />
                      </motion.div>
                      <h3 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-orbitron)', color: '#fff', textShadow: '0 0 10px rgba(255, 255, 0, 0.5)' }}>Visualización de Datos</h3>
                      <p className="text-lg sm:text-xl mb-8" style={{ color: 'rgba(226, 232, 240, 0.8)' }}>
                        Interpreta tus mediciones con gráficos interactivos. Visualiza curvas de campo para un análisis preciso.
                      </p>
                      <Link 
                        href="/calculadoras" 
                        onClick={() => sendGAEvent({ event: 'click_cta', value: 'hero_graficos' })}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-full transition-all"
                        style={{
                          fontFamily: 'var(--font-orbitron)',
                          background: 'transparent',
                          border: '2px solid #ffff00',
                          color: '#ffff00',
                          boxShadow: '0 0 20px rgba(255, 255, 0, 0.3), inset 0 0 10px rgba(255, 255, 0, 0.1)',
                          textShadow: '0 0 10px rgba(255, 255, 0, 0.5)'
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

      <section className="py-16" style={{ background: 'rgba(3, 7, 18, 0.8)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-orbitron)', color: '#00ffff', textShadow: '0 0 10px rgba(0, 255, 255, 0.5)' }}>
              Calculadoras Disponibles
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(226, 232, 240, 0.7)' }}>
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

      <section className="py-16" style={{ background: 'rgba(3, 7, 18, 0.5)' }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-orbitron)', color: '#ff00ff', textShadow: '0 0 10px rgba(255, 0, 255, 0.5)' }}>
              Informes Disponibles
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(226, 232, 240, 0.7)' }}>
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