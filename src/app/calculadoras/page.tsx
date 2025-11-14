import CalculadoraCard, { ColorType } from '@/components/CalculadoraCard';
import { ReactNode } from 'react';

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
    description: ' Calcula la sección minima del conductor. Determina la sección necesaria para imitar la Caída de Tensión y asegurar que el voltaje que llega a la carga final (💡) sea suficiente, garantizando el correcto funcionamiento y eficiencia del circuito.',
    icon: (
      // Ícono de Regla (Ruler) o Medida
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10V5.734a1 1 0 00-.707-.94L9 3.526M14 10H5.5C4.672 10 4 10.672 4 11.5v5C4 17.328 4.672 18 5.5 18H18c.828 0 1.5-.672 1.5-1.5V10H14zm0 0l-5 5" />
      </svg>
    ),
    color: 'blue'
  },
  {
    id: 'caida-tension',
    title: 'Cálculo de Caída de Tensión',
    description: 'Determina el porcentaje de pérdida de voltaje que ocurrirá en un conductor ya dimensionado. Este cálculo es esencial para verificar que el voltaje final que recibe la carga cumpla con los límites normativos , asegurando el óptimo rendimiento de los equipos. 📉🔌',
    icon: (
      // Ícono de Rayo (Bolt) para indicar Electricidad/Voltaje
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'emerald'
  },
  {
    id: 'seccion-ric',
    title: 'Corriente Admisible por RIC',
    description: 'Permite determinar la máxima corriente segura (admisible) que puede transportar un conductor, según sus características (tipo de aislamiento, material, etc.) y la normativa chilena RIC, incluyendo la revisión de sus propiedades.',
    icon: (
      // Ícono de Conductor (Cable)
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'amber'
  },
  {
    id: 'empalmes',
    title: 'Buscador Normativo de Empalmes',
    description: 'Herramienta de consulta rápida que ayuda a seleccionar el empalme eléctrico (conexión a la red) ideal para tu proyecto, asegurando el cumplimiento de la normativa eléctrica vigente (RIC u otra aplicable).',
    icon: (
      // Ícono de Búsqueda (Search)
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: 'red'
  },
  {
    id: 'calculadora-corriente',
    title: 'Cálculo General de Corriente (Amperaje)',
    description: 'Calcula la corriente eléctrica (Amperes) necesaria para cualquier instalación, utilizando la potencia (Watts), el voltaje y el factor de potencia para sistemas tanto monofásicos como trifásicos.',
    icon: (
      // Ícono de Calculadora (Calculator)
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v.01M17 4v.01M12 10v.01M17 10v.01M12 16v.01M17 16v.01M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'purple'
  },
  
  {
    id: 'rotuladora',
    title: 'Generador de Rótulos de Tableros Eléctricos',
    description: 'Crea rótulos e identificadores personalizados para tableros eléctricos. Descarga o imprime directamente en formato PDF, cumpliendo con los estándares y normativas vigentes de etiquetado.',
    icon: (
      // Ícono de Etiqueta (Tag)
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h.01M17 3h.01M7 17h.01M17 17h.01M4 12h16M4 12a8 8 0 0016 0M4 12a8 8 0 0116 0M4 12v.01" />
      </svg>
    ),
    color: 'green'
  },
 

];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Calculadoras Eléctricas</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Selecciona una de nuestras calculadoras especializadas para realizar tus cálculos eléctricos de manera precisa y eficiente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {calculadoras.map((calc) => (
          <CalculadoraCard
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