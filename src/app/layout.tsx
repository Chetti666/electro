import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
