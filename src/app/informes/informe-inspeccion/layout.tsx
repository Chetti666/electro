import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Informe de Inspección Eléctrica - Levantamiento de Instalaciones | VMElectric',
  description: 'Genera informes de inspección para levantamiento de instalaciones eléctricas existentes. Detalla puntos críticos, observaciones y recomendaciones técnicas.',
  alternates: {
    canonical: 'https://vmelectric.cl/informes/informe-inspeccion',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
