import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Informe de Resistividad - Medición SEV Puesta a Tierra | VMElectric',
  description: 'Registra y visualiza la curva SEV (Sondeo Eléctrico Vertical). Genera informe de medición de resistividad para sistemas de puesta a tierra según normativa.',
  alternates: {
    canonical: 'https://vmelectric.cl/informes/informe-resistividad',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
