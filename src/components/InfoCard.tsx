// src/app/about/InfoCard.tsx
import React from 'react';

interface InfoCardProps {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  iconBgClass: string;
  iconTextClass: string;
  isCard?: boolean; // Prop opcional para aplicar estilo de tarjeta
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  children,
  iconBgClass,
  iconTextClass,
  isCard = false, // Valor por defecto
}) => {
  const cardClasses = isCard 
    ? 'card rounded-lg p-6 lg:p-8 transition-all duration-300 hover:bg-gray-800/60 hover:-translate-y-1' 
    : '';

  return (
    <div className={`flex items-start gap-5 ${cardClasses}`}>
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${iconBgClass}`}
      >
        {React.cloneElement(icon, { className: `h-5 w-5 ${iconTextClass}` })}
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-white">{title}</h3>
        <p className="text-md mt-2 leading-relaxed text-gray-300">
          {children}
        </p>
      </div>
    </div>
  );
};
