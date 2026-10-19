import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cálculo de Caída de Tensión - Porcentaje de Pérdida | VMElectric',
  description: 'Determina el porcentaje de pérdida de voltaje en un conductor eléctrico. Verifica el cumplimiento normativo RIC y la caída de tensión en instalaciones chilenas.',
  alternates: {
    canonical: 'https://vmelectric.cl/calculadoras/caida-tension',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
