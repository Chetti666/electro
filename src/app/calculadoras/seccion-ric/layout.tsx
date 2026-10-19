import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Corriente Admisible por RIC - Máxima Corriente Segura | VMElectric',
  description: 'Determina la máxima corriente segura en conductores eléctricos según características del conductor y normativa chilena RIC. Cumple con los requisitos SEC.',
  alternates: {
    canonical: 'https://vmelectric.cl/calculadoras/seccion-ric',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
