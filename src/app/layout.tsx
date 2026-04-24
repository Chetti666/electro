import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GoogleAnalytics } from '@next/third-parties/google';

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
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
      <body
        className={`${orbitron.variable} ${rajdhani.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
      <GoogleAnalytics gaId="G-K79465K2BD" />
    </html>
  );
}
