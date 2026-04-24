'use client';

import Link from 'next/link';
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ColorType = 'blue' | 'emerald' | 'amber' | 'purple' | 'green' | 'red';

export interface InformeCardProps {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: ColorType;
  className?: string;
}

const InformeCard = React.forwardRef<HTMLAnchorElement, InformeCardProps>(({ className, id, title, description, icon, color }, ref) => {
  const colorClasses = {
    blue: {
      border: 'rgba(0, 255, 255, 0.3)',
      borderHover: 'rgba(0, 255, 255, 0.6)',
      bg: 'rgba(0, 128, 255, 0.1)',
      icon: '#00ffff',
      text: '#e2e8f0',
      shadow: 'rgba(0, 255, 255, 0.2)'
    },
    emerald: {
      border: 'rgba(0, 255, 128, 0.3)',
      borderHover: 'rgba(0, 255, 128, 0.6)',
      bg: 'rgba(0, 255, 128, 0.1)',
      icon: '#00ff80',
      text: '#e2e8f0',
      shadow: 'rgba(0, 255, 128, 0.2)'
    },
    amber: {
      border: 'rgba(255, 255, 0, 0.3)',
      borderHover: 'rgba(255, 255, 0, 0.6)',
      bg: 'rgba(255, 255, 0, 0.1)',
      icon: '#ffff00',
      text: '#e2e8f0',
      shadow: 'rgba(255, 255, 0, 0.2)'
    },
    purple: {
      border: 'rgba(128, 0, 255, 0.3)',
      borderHover: 'rgba(128, 0, 255, 0.6)',
      bg: 'rgba(128, 0, 255, 0.1)',
      icon: '#8000ff',
      text: '#e2e8f0',
      shadow: 'rgba(128, 0, 255, 0.2)'
    },
    green: {
      border: 'rgba(0, 255, 80, 0.3)',
      borderHover: 'rgba(0, 255, 80, 0.6)',
      bg: 'rgba(0, 255, 80, 0.1)',
      icon: '#00ff50',
      text: '#e2e8f0',
      shadow: 'rgba(0, 255, 80, 0.2)'
    },
    red: {
      border: 'rgba(255, 0, 64, 0.3)',
      borderHover: 'rgba(255, 0, 64, 0.6)',
      bg: 'rgba(255, 0, 64, 0.1)',
      icon: '#ff0040',
      text: '#e2e8f0',
      shadow: 'rgba(255, 0, 64, 0.2)'
    }
  };

  const colors = colorClasses[color];

  return (
    <Link
      href={`/informes/${id}`}
      ref={ref}
      className={cn("block h-full", className)}
      style={{ textDecoration: 'none' }}
    >
      <div
        className="h-full p-6 rounded-lg transition-all duration-300 cursor-pointer relative overflow-hidden group"
        style={{
          background: 'rgba(10, 15, 30, 0.8)',
          border: `1px solid ${colors.border}`,
          boxShadow: `0 0 10px ${colors.shadow}, inset 0 0 20px rgba(0, 0, 0, 0.3)`
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.icon}, transparent)`,
            boxShadow: `0 0 20px ${colors.icon}`
          }}
        />
        
        <div
          className="absolute top-0 right-0 w-20 h-20 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at center, ${colors.icon} 0%, transparent 70%)`,
            transform: 'translate(30%, -30%)'
          }}
        />

        <div>
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0 transition-all duration-300 group-hover:scale-110"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 0 15px ${colors.shadow}`
            }}
          >
            <div style={{ color: colors.icon, filter: `drop-shadow(0 0 5px ${colors.icon})` }}>
              {icon}
            </div>
          </div>
          <h2 
            className="text-lg sm:text-xl font-semibold mb-2" 
            style={{ 
              fontFamily: 'var(--font-orbitron)', 
              color: colors.text,
              textShadow: `0 0 10px ${colors.shadow}`
            }}
          >
            {title}
          </h2>
          <p className="mb-4" style={{ color: 'rgba(226, 232, 240, 0.6)', fontSize: '0.9rem', lineHeight: '1.6' }}>{description}</p>
        </div>
        
        <div 
          className="font-medium inline-flex items-center mt-4 transition-all duration-300 group-hover:translate-x-2"
          style={{ 
            color: colors.icon, 
            textShadow: `0 0 10px ${colors.icon}`,
            fontFamily: 'var(--font-orbitron)',
            fontSize: '0.75rem',
            letterSpacing: '1px'
          }}
        >
          ABRIR FORMULARIO
          <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ filter: `drop-shadow(0 0 5px ${colors.icon})` }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
});
InformeCard.displayName = "InformeCard";

export default InformeCard;