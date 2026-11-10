import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Sección de Cable y Conductores (mm² y AWG) | VMElectric',
  description: 'Calcula la sección del conductor en mm² o AWG según la caída de tensión admisible, la corriente y la longitud. Fórmulas universales para Chile, México y Perú.',
  keywords: [
    'calculadora de sección de cable',
    'calculo de seccion de conductores',
    'sección por caída de tensión',
    'calibre de cable',
    'sección de cable mm2',
    'AWG a mm2',
    'dimensionar conductor',
    'RIC N°4',
  ],
  alternates: {
    canonical: 'https://www.vmelectric.cl/calculadoras/seccion',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
