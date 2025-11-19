'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

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
      {/* Nueva Sección Hero con Acordeón */}
      <section className="py-12 md:py-12">
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
            className="w-full max-w-4xl mx-auto" 
            opts={{ loop: true }}
          >
            <CarouselContent>
              <CarouselItem>
                <div className="p-1">
                  <div className="card hover:shadow-lg transition-shadow text-center h-full flex flex-col justify-between p-8 md:p-12">
                    <div>
                      <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6 mx-auto">
                        <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
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
                  <div className="card hover:shadow-lg transition-shadow text-center h-full flex flex-col justify-between p-8 md:p-12">
                    <div>
                      <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mb-6 mx-auto">
                        <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
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
                  <div className="card hover:shadow-lg transition-shadow text-center h-full flex flex-col justify-between p-8 md:p-12">
                    <div>
                      <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-6 mx-auto">
                        <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
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

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Calculadoras disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cálculo de Sección */}
            <div className="card hover:shadow-lg transition-shadow text-center sm:text-left">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Cálculo de Sección</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Determina la sección adecuada de conductores según la corriente y caída de tensión.</p>
              <Link href="/calculadoras/seccion" className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center">
                Ir a calculadora
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Caída de Tensión */}
            <div className="card hover:shadow-lg transition-shadow text-center sm:text-left">
              <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Caída de Tensión</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Calcula la caída de tensión en circuitos eléctricos según distancia y carga.</p>
              <Link href="/calculadoras/caida-tension" className="text-emerald-500 hover:text-emerald-600 font-medium inline-flex items-center">
                Ir a calculadora
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Corriente admisible */}
            <div className="card hover:shadow-lg transition-shadow text-center sm:text-left">
              <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">corriente admisible de conductores</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Determina la corriente admisible de conductores según la norma RIC</p>
              <Link href="/calculadoras/seccion-ric" className="text-amber-500 hover:text-amber-600 font-medium inline-flex items-center">
                Ir a calculadora
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

           


           
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-500 dark:bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">¿Listo para optimizar tus cálculos eléctricos?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            ElectroCalc te ofrece herramientas precisas para tus proyectos eléctricos. Comienza a utilizarlas ahora.
          </p>
          <Link href="/calculadoras" className="btn bg-white text-blue-500 hover:bg-blue-50 font-medium px-6 py-3">
            Comenzar ahora
          </Link>
        </div>
      </section>
    </>
  );
}