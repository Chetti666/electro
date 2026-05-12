import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Nosotros - Herramientas Eléctricas Profesionales | VMElectric',
  description: 'Conócenos. VMElectric ofrece calculadoras eléctricas y generadores de informes para profesionales del sector. Nuestra misión es simplificar el trabajo en terreno.',
  alternates: {
    canonical: 'https://vmelectric.cl/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}