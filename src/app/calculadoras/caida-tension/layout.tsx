import type { Metadata } from 'next';
import { CAIDA_TENSION_FAQS } from '@/lib/caida-tension-faq';

const PAGE_URL = 'https://vmelectric.cl/calculadoras/caida-tension';

export const metadata: Metadata = {
  title: 'Calculadora de Caída de Tensión Online (Voltaje) | VMElectric',
  description:
    'Calculadora de caída de tensión gratis: obtén la pérdida de voltaje en V y % para instalaciones monofásicas y trifásicas de Chile, México, Perú y Latinoamérica.',
  keywords: [
    'calculadora caída de tensión',
    'caída de tensión',
    'calcular caída de tensión',
    'caída de voltaje',
    'voltage drop calculator',
    'caída de tensión monofásica',
    'caída de tensión trifásica',
    'calculadora eléctrica gratis',
    'caída de tensión Chile',
    'caída de tensión México',
    'caída de tensión Perú',
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Calculadora de Caída de Tensión Online (Voltaje) | VMElectric',
    description:
      'Calcula gratis la caída de tensión en voltios y porcentaje, la longitud máxima admisible y el cumplimiento del límite del 3 %. Fórmulas universales para Chile, México, Perú y Latinoamérica.',
    url: PAGE_URL,
    siteName: 'VMElectric',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Caída de Tensión Online | VMElectric',
    description:
      'Calcula la pérdida de voltaje en V y % en circuitos monofásicos y trifásicos. Gratis y sin registro.',
  },
};

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Calculadora de Caída de Tensión',
    url: PAGE_URL,
    description:
      'Calculadora gratuita de caída de tensión para circuitos monofásicos y trifásicos. Calcula la pérdida de voltaje en voltios y porcentaje, la longitud máxima del conductor y verifica el límite del 3 %.',
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
      'Cálculo de caída de tensión en voltios y porcentaje',
      'Circuitos monofásicos y trifásicos',
      'Selección de sección en mm² y equivalencia AWG',
      'Longitud máxima admisible según el límite del 3 %',
      'Gráfico de caída de tensión versus longitud',
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
        item: 'https://vmelectric.cl/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Calculadoras',
        item: 'https://vmelectric.cl/calculadoras',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Calculadora de caída de tensión',
        item: PAGE_URL,
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CAIDA_TENSION_FAQS.map(({ question, answer }) => ({
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
