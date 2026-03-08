import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vigía Córdoba — Sistema de Alertas Tempranas",
  description: "Dashboard de monitoreo en tiempo real para gestión del riesgo por inundaciones en el departamento de Córdoba, Colombia. Integra datos hidrometeorológicos, satelitales y de emergencias.",
  keywords: ["Córdoba", "Colombia", "inundaciones", "alertas tempranas", "río Sinú", "gestión del riesgo", "SAT"],
  openGraph: {
    title: "Vigía Córdoba — Sistema de Alertas Tempranas",
    description: "Monitoreo en tiempo real del riesgo por inundaciones en Córdoba, Colombia",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
