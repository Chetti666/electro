import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Informe Fotográfico RIC N°18 - Pliego Técnico Normativo | VMElectric',
  description: 'Genera el informe fotográfico bajo los requisitos del Pliego Técnico Normativo RIC N°18. Cumple con las exigencias de la SEC para instalaciones eléctricas en Chile.',
  alternates: {
    canonical: 'https://vmelectric.cl/informes/informe-fotografico',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
