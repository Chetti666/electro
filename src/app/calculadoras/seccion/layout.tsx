import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cálculo de Sección de Conductores - Normativa RIC | VMElectric',
  description: 'Calcula la sección mínima del conductor eléctrico según normativa chilena RIC. Limita la caída de tensión y asegura el voltaje correcto en tus instalaciones.',
  alternates: {
    canonical: 'https://vmelectric.cl/calculadoras/seccion',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
