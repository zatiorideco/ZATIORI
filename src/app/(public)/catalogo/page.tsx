import type { Metadata } from "next";
import Link from "next/link";
import { getEspejosPublicados } from "@/lib/catalogo";
import { TIPOS_MARCO } from "@/lib/espejos-data";
import { EspejoCard } from "@/components/public/EspejoCard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Catálogo de espejos",
  description:
    "Espejos artesanales disponibles: de pie, decorativos e industriales. Piezas únicas con marcos de madera hechas en Bahía Blanca.",
};

export const dynamic = "force-dynamic";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: { marco?: string };
}) {
  const espejos = await getEspejosPublicados();
  const marcoActivo = searchParams.marco;
  const filtrados = marcoActivo
    ? espejos.filter((e) => e.tipoMarco === marcoActivo)
    : espejos;

  return (
    <div className="container py-12">
      <p className="font-editorial italic text-madera">Piezas únicas</p>
      <h1 className="mt-2 font-display text-4xl uppercase text-espresso md:text-5xl">
        Catálogo
      </h1>
      <p className="mt-3 max-w-xl text-negro/75">
        Espejos listos para llevar. Si querés uno con otras medidas, madera o
        pátina,{" "}
        <Link href="/configurador" className="underline hover:text-madera">
          diseñalo a medida
        </Link>
        .
      </p>

      {/* Filtros por tipo de marco */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/catalogo"
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            !marcoActivo
              ? "border-espresso bg-espresso text-crema"
              : "border-arena bg-card hover:border-madera"
          )}
        >
          Todos
        </Link>
        {TIPOS_MARCO.map((tipo) => (
          <Link
            key={tipo}
            href={`/catalogo?marco=${encodeURIComponent(tipo)}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              marcoActivo === tipo
                ? "border-espresso bg-espresso text-crema"
                : "border-arena bg-card hover:border-madera"
            )}
          >
            {tipo}
          </Link>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">
          No hay espejos en esta categoría por ahora. Escribinos por WhatsApp y
          te contamos qué tenemos en el taller.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((e) => (
            <EspejoCard key={e.slug} espejo={e} />
          ))}
        </div>
      )}
    </div>
  );
}
