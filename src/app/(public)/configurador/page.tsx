import type { Metadata } from "next";
import Link from "next/link";
import { Hammer } from "lucide-react";
import { whatsappLink } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Espejos a medida",
  description:
    "Diseñá tu espejo a medida: elegí medidas, madera, pátina y tallado. Lo fabricamos en nuestro taller de Bahía Blanca.",
};

// Placeholder de Fase 2: el configurador paso a paso llega en la Fase 3.
export default function ConfiguradorPage() {
  return (
    <div className="container flex flex-col items-center py-24 text-center">
      <Hammer className="h-10 w-10 text-madera" />
      <h1 className="mt-4 font-display text-4xl uppercase text-espresso md:text-5xl">
        Tu espejo, a tu medida
      </h1>
      <p className="mt-4 max-w-lg font-editorial text-lg text-negro/80">
        Estamos terminando el configurador online para que elijas medidas,
        madera, pátina y tallado paso a paso. Mientras tanto, contanos tu idea
        por WhatsApp y la cotizamos en el día.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          href={whatsappLink(
            "¡Hola Zatiori! Quiero un espejo a medida. Las medidas que necesito son:"
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg">Cotizar por WhatsApp</Button>
        </a>
        <Link href="/catalogo">
          <Button size="lg" variant="outline">
            Ver espejos disponibles
          </Button>
        </Link>
      </div>
    </div>
  );
}
