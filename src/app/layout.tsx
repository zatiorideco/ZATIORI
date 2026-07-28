import type { Metadata } from "next";
import { Anton, Fraunces, Inter } from "next/font/google";
import { SITE_URL, NEGOCIO } from "@/lib/constants";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zatiori — Almacén de Espejos | Bahía Blanca",
    template: "%s | Zatiori",
  },
  description:
    "Espejos artesanales con marcos de madera nueva y reciclada. Piezas únicas hechas en Bahía Blanca, Argentina.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: NEGOCIO.nombre,
    url: SITE_URL,
    title: "Zatiori — Almacén de Espejos | Bahía Blanca",
    description:
      "Espejos artesanales con marcos de madera nueva y reciclada. Piezas únicas hechas en Bahía Blanca, Argentina.",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: NEGOCIO.nombre,
  description: NEGOCIO.descripcion,
  url: SITE_URL,
  email: NEGOCIO.email,
  telephone: `+${NEGOCIO.whatsapp}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bahía Blanca",
    addressRegion: "Buenos Aires",
    addressCountry: "AR",
  },
  sameAs: [NEGOCIO.instagramUrl],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body
        className={`${anton.variable} ${fraunces.variable} ${inter.variable} min-h-screen`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        {children}
      </body>
    </html>
  );
}
