import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre VMElectric - Herramientas Gratis y Comunidad Eléctrica',
  description: 'Un proyecto abierto para técnicos e instaladores eléctricos: calculadoras e informes gratuitos, sin planes ni suscripciones. Se sostiene con donaciones voluntarias y con la personalización de herramientas existentes para empresas.',
  keywords: ['herramientas eléctricas gratis', 'comunidad eléctrica', 'calculadoras eléctricas sin registro', 'donar proyecto eléctrico', 'personalización de herramientas eléctricas'],
  alternates: {
    canonical: 'https://www.vmelectric.cl/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}