import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';
import { GoogleAnalytics } from '@next/third-parties/google';
import RouteTracker from '@/components/RouteTracker';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VMElectric',
  url: 'https://www.vmelectric.cl',
  logo: 'https://www.vmelectric.cl/icon-512.png',
  email: 'vmelectric2025@gmail.com',
  description:
    'Herramientas eléctricas online para profesionales: calculadoras de caída de tensión, sección de conductores, corriente y generadores de informes técnicos.',
  areaServed: ['CL', 'MX', 'PE'],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.vmelectric.cl'),
  title: "VMElectric - Herramientas Eléctricas Profesionales",
  description: "Plataforma integral para cálculos eléctricos, informes técnicos y herramientas normativas para profesionales de Chile, México, Perú y Latinoamérica.",
  keywords: ["RIC", "TE1", "PLIEGO", "SEC", "4/2003", "calculadora eléctrica", "informe eléctrico", "normativa chilena", "instalaciones eléctricas"],
  alternates: {
    canonical: 'https://www.vmelectric.cl',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VMElectric',
  },
  openGraph: {
    title: "VMElectric - Herramientas Eléctricas Profesionales",
    description: "Calculadoras de sección, caída de tensión, informes SEV y más herramientas para electricistas de Chile, México, Perú y Latinoamérica.",
    url: "https://www.vmelectric.cl",
    siteName: "VMElectric",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VMElectric - Herramientas Eléctricas Profesionales",
    description: "Calculadoras eléctricas, informes técnicos y normativa para electricistas de Chile, México, Perú y Latinoamérica.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#0b1121" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="VMElectric" />
      </head>
      <body
        className={`${inter.variable} ${rajdhani.variable} antialiased min-h-screen flex flex-col`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <RouteTracker />
        <Header />
        <main className="flex-grow pb-16 md:pb-0">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer />
        <BottomNav />
      </body>
      <GoogleAnalytics gaId="G-K79465K2BD" />
    </html>
  );
}
