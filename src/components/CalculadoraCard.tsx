import Link from 'next/link';
import { ReactNode } from 'react';

export type ColorType = 'blue' | 'emerald' | 'amber' | 'purple' | 'green' | 'red';

interface CalculadoraCardProps {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: ColorType;
}

export default function CalculadoraCard({ id, title, description, icon, color }: CalculadoraCardProps) {
  // Mapeo de colores para clases de Tailwind
  const colorClasses = {
    blue: {
      border: 'border-blue-500 hover:border-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-500 hover:text-blue-600'
    },
    emerald: {
      border: 'border-emerald-500 hover:border-emerald-600',
      bg: 'bg-emerald-100 dark:bg-emerald-900',
      text: 'text-emerald-500 hover:text-emerald-600'
    },
    amber: {
      border: 'border-amber-500 hover:border-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-900',
      text: 'text-amber-500 hover:text-amber-600'
    },
    purple: {
      border: 'border-purple-500 hover:border-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-500 hover:text-purple-600'
    },
    green: {
      border: 'border-green-500 hover:border-green-600',
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-500 hover:text-green-600'
    },
    red: {
      border: 'border-red-500 hover:border-red-600',
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-500 hover:text-red-600'
    }
  };

  return (
    <Link 
      href={`/calculadoras/${id}`}
      className={`card hover:shadow-lg transition-shadow border-t-4 ${colorClasses[color].border} text-center sm:text-left`}
    >
      <div className={`h-12 w-12 ${colorClasses[color].bg} rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0`}>
        <div className={colorClasses[color].text}>
          {icon}
        </div>
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      <div className={`${colorClasses[color].text} font-medium inline-flex items-center`}>
        Abrir calculadora
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
