import type { Metadata } from "next";
import { Anton, Fraunces, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Zatiori — Almacén de Espejos | Bahía Blanca",
    template: "%s | Zatiori",
  },
  description:
    "Espejos artesanales con marcos de madera nueva y reciclada. Piezas únicas hechas en Bahía Blanca, Argentina.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body
        className={`${anton.variable} ${fraunces.variable} ${inter.variable} min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
