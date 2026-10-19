import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cálculo General de Corriente Eléctrica (Amperes) | VMElectric',
  description: 'Calcula la corriente eléctrica en Amperes usando potencia, voltaje y factor de potencia. Ideal para instalaciones monofásicas y trifásicas según normativa chilena.',
  alternates: {
    canonical: 'https://vmelectric.cl/calculadoras/calculadora-corriente',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
