import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generadores de Informes Eléctricos - SEV, Presupuesto, Inspección | VMElectric',
  description: 'Crea informes eléctricos profesionales: Sondeos Eléctricos Verticales (SEV), presupuestos, informes fotográficos RIC N°18 e inspecciones. Exporta a PDF.',
  alternates: {
    canonical: 'https://vmelectric.cl/informes',
  },
};

export default function InformesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}