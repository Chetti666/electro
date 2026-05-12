import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import PageTransition from '@/components/PageTransition';
import { GoogleAnalytics } from '@next/third-parties/google';

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

export const metadata: Metadata = {
  title: "VMElectric - Herramientas Eléctricas Profesionales",
  description: "Plataforma integral para cálculos eléctricos, informes técnicos y herramientas normativas para profesionales en Chile.",
  icons: {
    icon: '/electrocalc-logo.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VMElectric',
  },
  openGraph: {
    title: "VMElectric - Herramientas Eléctricas Profesionales",
    description: "Calculadoras de sección, caída de tensión, informes SEV y más herramientas para electricistas.",
    url: "https://vmelectric.cl",
    siteName: "VMElectric",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VMElectric - Herramientas Eléctricas Profesionales",
    description: "Calculadoras de sección, caída de tensión, informes SEV y más herramientas para electricistas.",
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
