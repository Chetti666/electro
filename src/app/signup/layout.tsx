import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Cuenta - VMElectric',
  description: 'Crea tu cuenta gratuita en VMElectric y accede a todas las herramientas eléctricas profesionales.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
