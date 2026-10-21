import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Donar a VMElectric - Apoya las herramientas eléctricas gratuitas',
  description:
    'Tu donación mantiene gratuitas las calculadoras eléctricas, los informes técnicos y los contenidos normativos de VMElectric. Pago seguro con Flow.',
  keywords: [
    'donar VMElectric',
    'apoyar calculadoras eléctricas',
    'donación electricistas Chile',
    'Flow',
  ],
  alternates: {
    canonical: 'https://vmelectric.cl/donar',
  },
  openGraph: {
    title: 'Donar a VMElectric',
    description:
      'Ayúdanos a mantener las herramientas eléctricas gratuitas para profesionales en Chile.',
    url: 'https://vmelectric.cl/donar',
    siteName: 'VMElectric',
    locale: 'es_CL',
    type: 'website',
  },
};

export default function DonarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
