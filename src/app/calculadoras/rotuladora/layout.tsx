import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Rótulos para Tableros Eléctricos | VMElectric',
  description: 'Crea rótulos personalizados para tableros eléctricos. Genera y descarga en PDF con la información normalizada requerida por la SEC para instalaciones eléctricas.',
  alternates: {
    canonical: 'https://vmelectric.cl/calculadoras/rotuladora',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
