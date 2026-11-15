import type { Metadata } from 'next';
import './orden-trabajo.css';

export const metadata: Metadata = {
  title:
    'Generador de Órdenes de Trabajo A4 con Folio Consecutivo | VMElectric',
  description:
    'Genera e imprime talonarios de órdenes de trabajo eléctricas en blanco, con folio consecutivo y formato A4. Sin captura de datos: solo eliges el folio inicial, la cantidad y la emisión.',
  keywords: [
    'orden de trabajo',
    'talonario',
    'folio',
    'orden de trabajo eléctrica',
    'plantilla orden de trabajo',
    'A4',
    'SEC',
    'instalación eléctrica',
  ],
  alternates: {
    canonical: 'https://www.vmelectric.cl/informes/orden-trabajo',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
