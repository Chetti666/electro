'use client';

import Link from 'next/link';
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ColorType = 'blue' | 'emerald' | 'amber' | 'purple' | 'green' | 'red';

export interface CalculadoraCardProps {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: ColorType;
  className?: string;
}

const CalculadoraCard = React.forwardRef<HTMLAnchorElement, CalculadoraCardProps>(({ className, id, title, description, icon, color }, ref) => {
  const colorClasses = {
    blue: {
      border: 'rgba(37, 99, 235, 0.3)',
      bg: 'rgba(37, 99, 235, 0.1)',
      icon: '#3b82f6',
      text: '#e2e8f0',
    },
    emerald: {
      border: 'rgba(16, 185, 129, 0.3)',
      bg: 'rgba(16, 185, 129, 0.1)',
      icon: '#10b981',
      text: '#e2e8f0',
    },
    amber: {
      border: 'rgba(245, 158, 11, 0.3)',
      bg: 'rgba(245, 158, 11, 0.1)',
      icon: '#f59e0b',
      text: '#e2e8f0',
    },
    purple: {
      border: 'rgba(139, 92, 246, 0.3)',
      bg: 'rgba(139, 92, 246, 0.1)',
      icon: '#8b5cf6',
      text: '#e2e8f0',
    },
    green: {
      border: 'rgba(34, 197, 94, 0.3)',
      bg: 'rgba(34, 197, 94, 0.1)',
      icon: '#22c55e',
      text: '#e2e8f0',
    },
    red: {
      border: 'rgba(239, 68, 68, 0.3)',
      bg: 'rgba(239, 68, 68, 0.1)',
      icon: '#ef4444',
      text: '#e2e8f0',
    }
  };

  const colors = colorClasses[color];

  return (
    <Link
      href={`/calculadoras/${id}`}
      ref={ref}
      className={cn("block h-full", className)}
      style={{ textDecoration: 'none' }}
    >
      <div
        className="h-full p-6 rounded-xl transition-all duration-200 cursor-pointer group"
        style={{
          background: 'var(--card-bg)',
          border: `1px solid var(--card-border)`,
        }}
      >
        <div
          className="h-12 w-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ color: colors.icon }}>
            {icon}
          </div>
        </div>
        <h2
          className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-primary-light transition-colors duration-200"
          style={{ color: colors.text }}
        >
          {title}
        </h2>
        <p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--foreground-dim)' }}>{description}</p>

        <div
          className="font-semibold inline-flex items-center text-xs transition-all duration-200 group-hover:translate-x-1"
          style={{
            color: colors.icon,
            letterSpacing: '0.5px'
          }}
        >
          ABRIR CALCULADORA
          <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
});
CalculadoraCard.displayName = "CalculadoraCard";

export default CalculadoraCard;
