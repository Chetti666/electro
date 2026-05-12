import React from 'react';

interface InfoCardProps {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  iconBgClass: string;
  iconTextClass: string;
  isCard?: boolean;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  children,
  iconBgClass,
  iconTextClass,
  isCard = false,
}) => {
  const cardClasses = isCard
    ? 'card rounded-xl p-6 lg:p-8 transition-all duration-200 hover:-translate-y-1'
    : '';

  return (
    <div className={`flex items-start gap-5 ${cardClasses}`}>
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${iconBgClass}`}
      >
        {React.cloneElement(icon, { className: `h-5 w-5 ${iconTextClass}` })}
      </div>
      <div>
        <h3 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h3>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
          {children}
        </p>
      </div>
    </div>
  );
};
