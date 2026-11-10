import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadoras Eléctricas Online - Sección y Caída de Tensión | VMElectric',
  description: 'Calculadoras eléctricas gratis: sección de conductores, caída de tensión, corriente y empalmes. Fórmulas universales para profesionales de Chile, México, Perú y Latinoamérica.',
  keywords: ['calculadora eléctrica', 'calculadora caída de tensión', 'sección conductores', 'caída tensión', 'corriente admisible', 'empalme normativo', 'calculadora eléctrica México', 'calculadora eléctrica Perú'],
  alternates: {
    canonical: 'https://vmelectric.cl/calculadoras',
  },
};

export default function CalculadorasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}