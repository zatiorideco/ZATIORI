import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatARS } from "@/lib/utils";
import type { EspejoPublico } from "@/lib/espejos-data";

const CATORCE_DIAS = 14 * 24 * 3600 * 1000;

export function EspejoCard({ espejo }: { espejo: EspejoPublico }) {
  const esNuevo =
    !!espejo.creado &&
    Date.now() - new Date(espejo.creado).getTime() < CATORCE_DIAS &&
    espejo.estado === "DISPONIBLE";
  return (
    <Link
      href={`/catalogo/${espejo.slug}`}
      className="group overflow-hidden rounded-lg border border-arena bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={espejo.fotos[0] ?? "/brand/logo.svg"}
          alt={espejo.nombre}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {espejo.estado !== "DISPONIBLE" ? (
          <Badge
            variant={espejo.estado === "VENDIDO" ? "destructive" : "accent"}
            className="absolute left-3 top-3"
          >
            {espejo.estado === "VENDIDO" ? "Ya tiene casa" : "Reservado"}
          </Badge>
        ) : (
          esNuevo && (
            <Badge variant="accent" className="absolute left-3 top-3">
              Nuevo
            </Badge>
          )
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wider text-madera">
          {espejo.tipoMarco}
          <span className="normal-case tracking-normal text-muted-foreground">
            {" "}· Pieza única
          </span>
        </p>
        <h3 className="mt-1 font-display text-lg uppercase tracking-wide text-espresso">
          {espejo.nombre}
        </h3>
        {espejo.alto && espejo.ancho && (
          <p className="text-sm text-muted-foreground">
            {espejo.ancho} × {espejo.alto} cm
          </p>
        )}
        <p className="mt-2 font-editorial text-lg text-negro">
          {formatARS(espejo.precio)}
        </p>
      </div>
    </Link>
  );
}
