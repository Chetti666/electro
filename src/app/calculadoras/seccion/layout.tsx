import type { Metadata } from 'next';
import { SECCION_FAQS } from '@/lib/seccion-faq';

const PAGE_URL = 'https://www.vmelectric.cl/calculadoras/seccion';

export const metadata: Metadata = {
  title: 'Calculadora de Sección de Cable y Conductores (mm² y AWG) | VMElectric',
  description:
    'Calcula la sección del conductor en mm² y AWG según la caída de tensión admisible, la corriente y la longitud. Fórmulas universales para Chile, México y Perú.',
  keywords: [
    'calculadora de sección de cable',
    'calculo de seccion de conductores',
    'sección por caída de tensión',
    'calibre de cable',
    'sección de cable mm2',
    'AWG a mm2',
    'dimensionar conductor',
    'qué sección de cable necesito',
    'RIC N°4',
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Calculadora de Sección de Cable y Conductores (mm² y AWG)',
    description:
      'Obtén la sección mínima del conductor en mm², la sección comercial recomendada y el calibre AWG equivalente. Gratis y sin registro.',
    url: PAGE_URL,
    siteName: 'VMElectric',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Sección de Cable (mm² y AWG) | VMElectric',
    description:
      'Calcula la sección del conductor por caída de tensión y obtén la equivalencia en AWG.',
  },
};

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Calculadora de Sección de Conductores',
    url: PAGE_URL,
    description:
      'Calculadora gratuita de sección de conductores por caída de tensión. Entrega la sección mínima en mm², la sección comercial recomendada y el calibre AWG equivalente.',
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
      'Sección mínima del conductor por caída de tensión',
      'Sección comercial recomendada en mm²',
      'Equivalencia en AWG y kcmil',
      'Circuitos monofásicos y trifásicos',
      'Tabla de secciones comerciales',
      'Historial de cálculos en el dispositivo',
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
        name: 'Calculadora de sección de conductores',
        item: PAGE_URL,
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SECCION_FAQS.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
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
