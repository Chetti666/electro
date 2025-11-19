'use client';

import React, { useEffect, useState, useRef, ReactNode } from 'react';
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import CalculadoraCard, { ColorType as CalculadoraColor } from '@/components/CalculadoraCard';
import InformeCard, { ColorType as InformeColor } from '@/components/InformeCard';

// --- Hook para detectar si un elemento está en la vista ---
const useInView = <T extends HTMLElement>(options: IntersectionObserverInit = {}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current; // Captura el valor de ref.current
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Actualiza el estado para reflejar si el elemento está visible o no
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(node);

    return () => {
      if (node) {
        observer.unobserve(node); // Usa la variable en la limpieza
      }
    };
  }, [options]);

  return [ref, isInView] as const;
};

// --- Componente para una Tarjeta Animada ---
// Este componente es una función de React válida, por lo que podemos usar hooks dentro de él.
const AnimatedCard: React.FC<{
  item: Calculadora | Informe;
  index: number;
  type: 'calculadora' | 'informe';
}> = ({ item, index, type }) => {
  const [ref, isInView] = useInView<HTMLAnchorElement>();
  const animationInClass = index % 2 === 0 ? 'animate-in fade-in-left duration-500' : 'animate-in fade-in-right duration-500';
  const animationOutClass = index % 2 === 0 ? 'animate-out fade-out-left duration-500' : 'animate-out fade-out-right duration-500';

  const CardComponent = type === 'calculadora' ? CalculadoraCard : InformeCard;

  return (
    <CardComponent
      {...item}
      ref={ref}
      className={`transition-opacity ${isInView ? `opacity-100 ${animationInClass}` : `opacity-0 ${animationOutClass}`}`}
    />
  );
};


type Calculadora = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: CalculadoraColor;
};

type Informe = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: InformeColor;
};

const calculadoras: Calculadora[] = [
  {
    id: 'seccion',
    title: 'Cálculo de Sección de Conductores',
    description: ' Calcula la sección minima del conductor. Determina la sección necesaria para imitar la Caída de Tensión y asegurar que el voltaje que llega a la carga final (💡) sea suficiente, garantizando el correcto funcionamiento y eficiencia del circuito.',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10V5.734a1 1 0 00-.707-.94L9 3.526M14 10H5.5C4.672 10 4 10.672 4 11.5v5C4 17.328 4.672 18 5.5 18H18c.828 0 1.5-.672 1.5-1.5V10H14zm0 0l-5 5" /></svg>,
    color: 'blue'
  },
  {
    id: 'caida-tension',
    title: 'Cálculo de Caída de Tensión',
    description: 'Determina el porcentaje de pérdida de voltaje que ocurrirá en un conductor ya dimensionado. Este cálculo es esencial para verificar que el voltaje final que recibe la carga cumpla con los límites normativos , asegurando el óptimo rendimiento de los equipos. 📉🔌',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    color: 'emerald'
  },
  {
    id: 'seccion-ric',
    title: 'Corriente Admisible por RIC',
    description: 'Permite determinar la máxima corriente segura (admisible) que puede transportar un conductor, según sus características (tipo de aislamiento, material, etc.) y la normativa chilena RIC, incluyendo la revisión de sus propiedades.',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    color: 'amber'
  },
  {
    id: 'empalmes',
    title: 'Buscador Normativo de Empalmes',
    description: 'Herramienta de consulta rápida que ayuda a seleccionar el empalme eléctrico (conexión a la red) ideal para tu proyecto, asegurando el cumplimiento de la normativa eléctrica vigente (RIC u otra aplicable).',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    color: 'red'
  },
  {
    id: 'calculadora-corriente',
    title: 'Cálculo General de Corriente (Amperaje)',
    description: 'Calcula la corriente eléctrica (Amperes) necesaria para cualquier instalación, utilizando la potencia (Watts), el voltaje y el factor de potencia para sistemas tanto monofásicos como trifásicos.',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v.01M17 4v.01M12 10v.01M17 10v.01M12 16v.01M17 16v.01M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    color: 'purple'
  },
  {
    id: 'rotuladora',
    title: 'Generador de Rótulos de Tableros Eléctricos',
    description: 'Crea rótulos e identificadores personalizados para tableros eléctricos. Descarga o imprime directamente en formato PDF, cumpliendo con los estándares y normativas vigentes de etiquetado.',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h.01M17 3h.01M7 17h.01M17 17h.01M4 12h16M4 12a8 8 0 0016 0M4 12a8 8 0 0116 0M4 12v.01" /></svg>,
    color: 'green'
  },
];

const informes: Informe[] = [
  {
    id: 'informe-resistividad',
    title: 'Generador de Informe de Resistividad del Terreno',
    description: 'Permite registrar y visualizar la curva de un sondeo eléctrico vertical (SEV). Genera un informe de medición en terreno de la resistividad para proyectos de puesta a tierra.',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 3-3 3 3m-4-6h.01M6 16v-1a4 4 0 00-4-4v-1a4 4 0 004-4v-1" /></svg>,
    color: 'green'
  },
  {
    id: 'presupuesto',
    title: 'Generador de Presupuestos Detallados',
    description: 'Crea presupuestos detallados y profesionales para tus proyectos. Exporta el documento en formato PDF de manera rápida y sencilla para compartir con tus clientes.',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2v4c0 1.105 1.343 2 3 2s3-.895 3-2v-4c0-1.105-1.343-2-3-2zM4 16v-4a8 8 0 018-8 8 8 0 018 8v4" /></svg>,
    color: 'green'
  },
  {
    id: 'informe-fotografico',
    title: 'Generador de Informe Fotográfico RIC N°18',
    description: 'Facilita la creación de tu informe fotográfico normativo. Genera el documento bajo los requisitos del Pliego Técnico Normativo RIC N°18 en formato PDF de forma ágil.',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l1.416-2.356A2 2 0 0111 3h2a2 2 0 011.664.89l1.416 2.356A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    color: 'green'
  },
  {
    id: 'informe-inspeccion',
    title: 'Generador de Informe de inspección de Instalaciones',
    description: 'Facilita la creación de tu informe fotográfico para el levantamiento de instalaciones existentes e inspección. Genera un reporte detallando los puntos criticos detectados, recomendaciones y evidencias de la inspección en formato PDF de forma ágil.',
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l1.416-2.356A2 2 0 0111 3h2a2 2 0 011.664.89l1.416 2.356A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    color: 'green'
  }
];

export default function Home() {
  const [api, setApi] = useState<CarouselApi>();
  const canScroll = useRef(true);

  useEffect(() => {
    if (!api) {
      return;
    }


    const handleWheel = (event: WheelEvent) => {
      if (!canScroll.current) return;
      
      event.preventDefault();
      canScroll.current = false; // Prevenir scrolls múltiples

      if (event.deltaY > 0) {

        api.scrollNext();
      } else {
        api.scrollPrev();
      }

      // Permitir el siguiente scroll después de un breve retraso
      setTimeout(() => {
        canScroll.current = true;
      }, 500); // 500ms de cooldown
    };


    const container = api.containerNode();
    container.addEventListener('wheel', handleWheel);

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [api]);


  return (
    <>
      
      <section className="pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Herramientas Eléctricas Profesionales
            </h1>
            <p className="text-md sm:text-lg text-gray-700 dark:text-gray-300">
              Desde cálculos de sección hasta informes de campo detallados, todo en una sola plataforma.
            </p>
          </div>

          <Carousel 
            setApi={setApi}
            className="w-full max-w-6xl mx-auto" 
            opts={{ loop: true }}
          >
            <CarouselContent>
              <CarouselItem>
                <div className="p-1">
                  <div className="card hover:shadow-lg transition-shadow text-center h-full flex flex-col justify-between p-8 md:p-16">
                    <div>
                      <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6 mx-auto">
                        <svg className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Calculadoras Eléctricas Precisas</h3>
                      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6">
                        Realiza cálculos complejos de forma rápida y segura. Determina la sección de conductores, la caída de tensión y la corriente admisible según normativas vigentes.
                      </p>
                    </div>
                    <Link href="/calculadoras" className="btn btn-primary mt-4">
                      Explorar Calculadoras
                    </Link>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="p-1">
                  <div className="card hover:shadow-lg transition-shadow text-center h-full flex flex-col justify-between p-8 md:p-16">
                    <div>
                      <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mb-6 mx-auto">
                        <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Informes de Campo Profesionales</h3>
                      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6">
                        Genera informes detallados de Sondeos Eléctricos Verticales (SEV) directamente desde tus datos de campo. Personaliza, añade imágenes y exporta a PDF.
                      </p>
                    </div>
                    <Link href="/informes/informe-resistividad" className="btn btn-secondary mt-4">
                      Crear un Informe
                    </Link>
                  </div>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="p-1">
                  <div className="card hover:shadow-lg transition-shadow text-center h-full flex flex-col justify-between p-8 md:p-16">
                    <div>
                      <div className="h-20 w-20 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-6 mx-auto">
                        <svg className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Gráficos y Visualización de Datos</h3>
                      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6">
                        Interpreta tus mediciones con gráficos logarítmicos interactivos. Visualiza la curva de campo de tus SEV para un análisis más claro y preciso.
                      </p>
                    </div>
                    <Link href="/calculadoras" className="btn btn-accent mt-4">
                      Explorar Herramientas
                    </Link>
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
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Calculadoras disponibles
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Herramientas especializadas para realizar tus cálculos eléctricos de manera precisa y eficiente.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {calculadoras.map((calc, index) => (
              <AnimatedCard key={calc.id} item={calc} index={index} type="calculadora" />
            ))}
          </div>
        </div>
      </section>

      {/* Informes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Informes Disponibles
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Genera documentos eléctricos profesionales y detallados de manera rápida y sencilla.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {informes.map((informe, index) => (
              <AnimatedCard key={informe.id} item={informe} index={index} type="informe" />
            ))}
          </div>
        </div>
      </section>

    </>
  );
}