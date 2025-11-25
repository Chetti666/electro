'use client';

import InformeCard, { ColorType } from '@/components/InformeCard';
import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import { Activity, FileText, Camera, Search } from 'lucide-react';

export default function Informes() {
  type Informe = {
    id: string;
    title: string;
    description: string;
    icon: ReactNode;
    color: ColorType;
  };

  const informes: Informe[] = [
    {
      id: 'informe-resistividad',
      title: 'Generador de Informe de Resistividad',
      description: 'Permite registrar y visualizar la curva de un sondeo eléctrico vertical (SEV). Genera un informe de medición en terreno de la resistividad.',
      icon: <Activity className="h-6 w-6" />,
      color: 'green'
    },
    {
      id: 'presupuesto',
      title: 'Generador de Presupuestos',
      description: 'Crea presupuestos detallados y profesionales para tus proyectos. Exporta el documento en formato PDF de manera rápida y sencilla.',
      icon: <FileText className="h-6 w-6" />,
      color: 'green'
    },
    {
      id: 'informe-fotografico',
      title: 'Generador de Informe Fotográfico',
      description: 'Facilita la creación de tu informe fotográfico normativo. Genera el documento bajo los requisitos del Pliego Técnico Normativo RIC N°18.',
      icon: <Camera className="h-6 w-6" />,
      color: 'green'
    },
    {
      id: 'informe-inspeccion',
      title: 'Generador de Informe de Inspección',
      description: 'Facilita la creación de tu informe para el levantamiento de instalaciones existentes. Detalla puntos críticos y recomendaciones.',
      icon: <Search className="h-6 w-6" />,
      color: 'green'
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

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 md:pt-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Informes Eléctricos</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Selecciona uno de nuestros generadores de informes especializados para crear documentos eléctricos profesionales y detallados.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {informes.map((informe) => (
          <motion.div key={informe.id} variants={itemVariants}>
            <InformeCard
              id={informe.id}
              title={informe.title}
              description={informe.description}
              icon={informe.icon}
              color={informe.color}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}