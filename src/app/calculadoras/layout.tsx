import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadoras Eléctricas - Cálculos de Sección, Caída de Tensión | VMElectric',
  description: 'Utiliza nuestras calculadoras eléctricas profesionales: cálculo de sección de conductores, caída de tensión, corriente admisible RIC, empalmes normativos y más.',
  alternates: {
    canonical: 'https://vmelectric.cl/calculadoras',
  },
};

export default function CalculadorasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}