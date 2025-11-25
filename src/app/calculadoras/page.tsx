'use client';

import CalculadoraCard, { ColorType } from '@/components/CalculadoraCard';
import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import { Zap, Activity, ShieldCheck, Search, Calculator, ClipboardCheck } from 'lucide-react';

export default function Calculadoras() {
  type Calculadora = {
    id: string;
    title: string;
    description: string;
    icon: ReactNode;
    color: ColorType;
  };

  const calculadoras: Calculadora[] = [
    {
      id: 'seccion',
      title: 'Cálculo de Sección de Conductores',
      description: 'Calcula la sección minima del conductor. Determina la sección necesaria para imitar la Caída de Tensión y asegurar que el voltaje que llega a la carga final (💡) sea suficiente.',
      icon: <Zap className="h-6 w-6" />,
      color: 'blue'
    },
    {
      id: 'caida-tension',
      title: 'Cálculo de Caída de Tensión',
      description: 'Determina el porcentaje de pérdida de voltaje que ocurrirá en un conductor ya dimensionado. Esencial para verificar el cumplimiento normativo.',
      icon: <Activity className="h-6 w-6" />,
      color: 'emerald'
    },
    {
      id: 'seccion-ric',
      title: 'Corriente Admisible por RIC',
      description: 'Permite determinar la máxima corriente segura (admisible) que puede transportar un conductor, según sus características y la normativa chilena RIC.',
      icon: <ShieldCheck className="h-6 w-6" />,
      color: 'amber'
    },
    {
      id: 'empalmes',
      title: 'Buscador Normativo de Empalmes',
      description: 'Herramienta de consulta rápida que ayuda a seleccionar el empalme eléctrico ideal para tu proyecto, asegurando el cumplimiento de la normativa vigente.',
      icon: <Search className="h-6 w-6" />,
      color: 'red'
    },
    {
      id: 'calculadora-corriente',
      title: 'Cálculo General de Corriente',
      description: 'Calcula la corriente eléctrica (Amperes) necesaria para cualquier instalación, utilizando la potencia, el voltaje y el factor de potencia.',
      icon: <Calculator className="h-6 w-6" />,
      color: 'purple'
    },
    {
      id: 'rotuladora',
      title: 'Generador de Rótulos',
      description: 'Crea rótulos e identificadores personalizados para tableros eléctricos. Descarga o imprime directamente en formato PDF.',
      icon: <ClipboardCheck className="h-6 w-6" />,
      color: 'green'
    },
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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Calculadoras Eléctricas</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Selecciona una de nuestras calculadoras especializadas para realizar tus cálculos eléctricos de manera precisa y eficiente.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {calculadoras.map((calc) => (
          <motion.div key={calc.id} variants={itemVariants}>
            <CalculadoraCard
              id={calc.id}
              title={calc.title}
              description={calc.description}
              icon={calc.icon}
              color={calc.color}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}