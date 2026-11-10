import type { Metadata } from 'next';

const PAGE_URL =
  'https://www.vmelectric.cl/calculadoras/calculadora-corriente';

export const metadata: Metadata = {
  title: 'Calculadora de Corriente y Potencia (Amperes, Watts y kW) | VMElectric',
  description:
    'Calculadora de corriente eléctrica gratis: obtén amperes, watts y kW a partir de la potencia y el voltaje en sistemas monofásicos y trifásicos. Fórmulas universales para Chile, México, Perú y Latinoamérica.',
  keywords: [
    'calculadora de corriente',
    'calculo de corriente',
    'calcular corriente con potencia y voltaje',
    'calculadora de watts',
    'calculadora potencia trifásica',
    'corriente trifásica',
    'corriente monofásica',
    'amperaje',
    'kW a amperes',
    'calculadora eléctrica gratis',
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Calculadora de Corriente y Potencia (Amperes, Watts y kW)',
    description:
      'Calcula la corriente en amperes o la potencia en watts y kW en circuitos monofásicos y trifásicos. Gratis, sin registro y con fórmulas universales.',
    url: PAGE_URL,
    siteName: 'VMElectric',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Corriente y Potencia | VMElectric',
    description:
      'Convierte potencia y voltaje en amperes, o amperes y voltaje en watts, para sistemas monofásicos y trifásicos.',
  },
};

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Calculadora de Corriente y Potencia',
    url: PAGE_URL,
    description:
      'Calculadora gratuita de corriente eléctrica y potencia para sistemas monofásicos y trifásicos. Obtén amperes a partir de watts y voltios, o watts a partir de amperes y voltios.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    inLanguage: 'es',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Cálculo de corriente en amperes a partir de potencia y voltaje',
      'Cálculo de potencia en watts y kW a partir de corriente y voltaje',
      'Sistemas monofásicos y trifásicos',
      'Factor de potencia configurable',
      'Historial de cálculos y guardado en la cuenta',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://www.vmelectric.cl/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Calculadoras',
        item: 'https://www.vmelectric.cl/calculadoras',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Calculadora de corriente y potencia',
        item: PAGE_URL,
      },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  );
}
