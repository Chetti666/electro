import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Presupuestos Eléctricos en PDF | VMElectric',
  description: 'Crea presupuestos detallados y profesionales para trabajos eléctricos. Exporta a PDF listo para entregar a clientes con el desglose de materiales y mano de obra.',
  alternates: {
    canonical: 'https://vmelectric.cl/informes/presupuesto',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
