import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión - VMElectric',
  description: 'Accede a tu cuenta VMElectric para guardar tus cálculos e informes.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
