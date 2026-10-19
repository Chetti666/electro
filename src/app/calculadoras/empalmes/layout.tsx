import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buscador Normativo de Empalmes Eléctricos | VMElectric',
  description: 'Consulta rápida para seleccionar el empalme eléctrico ideal según normativa vigente chilena. Encuentra el empalme correcto para cada tipo de instalación.',
  alternates: {
    canonical: 'https://vmelectric.cl/calculadoras/empalmes',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
