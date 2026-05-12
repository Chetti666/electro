import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto - Contáctanos | VMElectric',
  description: '¿Tienes preguntas sobre nuestras calculadoras o informes eléctricos? Contáctanos para soporte técnico, consultas o sugerencias.',
  alternates: {
    canonical: 'https://vmelectric.cl/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}