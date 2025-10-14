import CalculadoraCard, { ColorType } from '@/components/CalculadoraCard';

interface Calculadora {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: ColorType;
}

export default function Calculadoras() {
  const calculadoras: Calculadora[] = [
    {
      id: 'seccion',
      title: 'Cálculo de Sección',
      description: 'Determina la sección adecuada de conductores en base a la corriente y caída de tensión.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      id: 'caida-tension',
      title: 'Caída de Tensión',
      description: 'Calcula la caída de tensión en circuitos eléctricos según distancia y carga.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'emerald'
    },
    {
      id: 'seccion-ric',
      title: 'corriente admisible de conductores',
      description: 'La siguiente calculadora te ayudará a determinar la corriente admisible de conductores según la norma RIC, ademas de ver las características de los distintos tipos de conductores.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      color: 'amber'
    },
    {
      id: 'empalmes',
      title: 'Empalmes Eléctricos',
    description: 'El siguiente buscador te permitira encontrar el empalme ideal para tu proyecto mediante la normativa vigente.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      color: 'amber'},
    {
      id: 'calculadora-corriente',
      title: 'Calculadora General de Corriente',
      description: 'Calcula la corriente (Amperes) para sistemas monofásicos o trifásicos a partir de la potencia, voltaje y factor de potencia.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      color: 'amber'
    },
    {
      id: 'medicion-resistividad',
      title: 'Informe de Medición de Resistividad',
      description: 'Registra tus mediciones del sondeo electrico vertical, visualiza la curva de resistividad de sondeo vertical y genera un informe de medicion en terreno.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      color: 'amber'
    }
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
