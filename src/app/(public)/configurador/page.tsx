import type { Metadata } from "next";
import Link from "next/link";
import { Hammer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PRECIO_M2_BASE, PRECIO_MINIMO_BASE } from "@/lib/pedidos";
import { whatsappLink } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Configurador, type OpcionUI } from "@/components/public/Configurador";

export const metadata: Metadata = {
  title: "Espejos a medida",
  description:
    "Diseñá tu espejo a medida: elegí medidas, madera, pátina y tallado, y mirá el precio estimado al instante. Lo fabricamos en Bahía Blanca.",
};

export const dynamic = "force-dynamic";

async function getOpciones(): Promise<OpcionUI[]> {
  try {
    const opciones = await prisma.opcionConfigurador.findMany({
      where: { activo: true },
      orderBy: [{ tipo: "asc" }, { orden: "asc" }],
    });
    return opciones.map((o) => ({
      id: o.id,
      tipo: o.tipo,
      nombre: o.nombre,
      descripcion: o.descripcion,
      precioAdicional: Number(o.precioAdicional),
    }));
  } catch {
    return [];
  }
}

export default async function ConfiguradorPage() {
  const opciones = await getOpciones();

  // Sin DB u opciones: derivamos a WhatsApp en vez de mostrar un wizard vacío
  if (opciones.length === 0) {
    return (
      <div className="container flex flex-col items-center py-24 text-center">
        <Hammer className="h-10 w-10 text-madera" />
        <h1 className="mt-4 font-display text-4xl uppercase text-espresso">
          Tu espejo, a tu medida
        </h1>
        <p className="mt-4 max-w-lg font-editorial text-lg text-negro/80">
          El configurador no está disponible en este momento. Contanos tu idea
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

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-editorial italic text-madera">Pieza única, hecha para vos</p>
        <h1 className="mt-2 font-display text-4xl uppercase text-espresso md:text-5xl">
          Diseñá tu espejo
        </h1>
        <p className="mt-3 text-negro/75">
          Seis pasos, dos minutos. Al final te damos el precio estimado y tu
          pedido entra directo a la cola del taller.
        </p>
      </div>
      <div className="mt-10">
        <Configurador
          opciones={opciones}
          precioM2={PRECIO_M2_BASE}
          precioMinimo={PRECIO_MINIMO_BASE}
        />
      </div>
    </div>
  );
}
