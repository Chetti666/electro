import InformeCard, { ColorType } from '@/components/InformeCard'; //cambiar el componente importado
import { ReactNode } from 'react';

export default function Informes() {
  type Informe = {
    id: string;
    title: string;
    description: string;
    icon: ReactNode;
    color: ColorType;
  };

const calculadoras: Informe[] = [
 
  {
    id: 'informe-resistividad',
    title: 'Generador de Informe de Resistividad del Terreno',
    description: 'Permite registrar y visualizar la curva de un sondeo eléctrico vertical (SEV). Genera un informe de medición en terreno de la resistividad para proyectos de puesta a tierra.',
    icon: (
      // Ícono de Gráfico de Líneas (Chart Bar) para Curva de Resistividad
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 3-3 3 3m-4-6h.01M6 16v-1a4 4 0 00-4-4v-1a4 4 0 004-4v-1" />
      </svg>
    ),
    color: 'green'
  },
  {
    id: 'presupuesto',
    title: 'Generador de Presupuestos Detallados',
    description: 'Crea presupuestos detallados y profesionales para tus proyectos. Exporta el documento en formato PDF de manera rápida y sencilla para compartir con tus clientes.',
    icon: (
      // Ícono de Dinero (Cash) o Documento con Dinero
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2v4c0 1.105 1.343 2 3 2s3-.895 3-2v-4c0-1.105-1.343-2-3-2zM4 16v-4a8 8 0 018-8 8 8 0 018 8v4" />
      </svg>
    ),
    color: 'green'
  },
  {
    id: 'informe-fotografico',
    title: 'Generador de Informe Fotográfico RIC N°18',
    description: 'Facilita la creación de tu informe fotográfico normativo. Genera el documento bajo los requisitos del Pliego Técnico Normativo RIC N°18 en formato PDF de forma ágil.',
    icon: (
      // Ícono de Cámara de fotos (Camera)
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l1.416-2.356A2 2 0 0111 3h2a2 2 0 011.664.89l1.416 2.356A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'green'
  },
  {
    id: 'informe-inspeccion',
    title: 'Generador de Informe de inspección de Instalaciones',
    description: 'Facilita la creación de tu informe fotográfico para el levantamiento de instalaciones existentes e inspección. Genera un reporte detallando los puntos criticos detectados, recomendaciones y evidencias de la inspección en formato PDF de forma ágil.',
    icon: (
      // Ícono de Cámara de fotos (Camera)
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l1.416-2.356A2 2 0 0111 3h2a2 2 0 011.664.89l1.416 2.356A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'green'
  }
];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Informes Eléctricos</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Selecciona uno de nuestros generadores de informes especializados para crear documentos eléctricos profesionales y detallados de manera rápida y sencilla.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {calculadoras.map((calc) => (
          <InformeCard
            key={calc.id}
            id={calc.id}
            title={calc.title}
            description={calc.description}
            icon={calc.icon}
            color={calc.color}
          />
        ))}
      </div>
    </div>
  );
}