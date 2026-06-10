import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ruler, TreePine, Paintbrush } from "lucide-react";
import { getEspejoPorSlug, getEspejosPublicados } from "@/lib/catalogo";
import { whatsappLink } from "@/lib/constants";
import { formatARS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EspejoCard } from "@/components/public/EspejoCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const espejo = await getEspejoPorSlug(params.slug);
  if (!espejo) return { title: "Espejo no encontrado" };
  return {
    title: espejo.nombre,
    description: espejo.descripcion ?? undefined,
    openGraph: {
      title: `${espejo.nombre} | Zatiori`,
      description: espejo.descripcion ?? undefined,
      images: espejo.fotos[0] ? [espejo.fotos[0]] : undefined,
    },
  };
}

export default async function FichaEspejoPage({
  params,
}: {
  params: { slug: string };
}) {
  const espejo = await getEspejoPorSlug(params.slug);
  if (!espejo) notFound();

  const relacionados = (await getEspejosPublicados())
    .filter((e) => e.slug !== espejo.slug && e.tipoMarco === espejo.tipoMarco)
    .slice(0, 3);

  const mensajeWA = `¡Hola Zatiori! Me interesa el ${espejo.nombre}${
    espejo.ancho && espejo.alto ? ` (${espejo.ancho} × ${espejo.alto} cm)` : ""
  }. ¿Está disponible?`;

  return (
    <div className="container py-12">
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-madera"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Galería */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg">
            <Image
              src={espejo.fotos[0] ?? "/brand/logo.svg"}
              alt={espejo.nombre}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {espejo.fotos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {espejo.fotos.slice(1).map((foto, i) => (
                <div
                  key={foto}
                  className="relative aspect-square overflow-hidden rounded-md"
                >
                  <Image
                    src={foto}
                    alt={`${espejo.nombre} — foto ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalle */}
        <div>
          <p className="text-sm uppercase tracking-wider text-madera">
            {espejo.tipoMarco}
          </p>
          <h1 className="mt-2 font-display text-4xl uppercase text-espresso md:text-5xl">
            {espejo.nombre}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <p className="font-editorial text-3xl text-negro">
              {formatARS(espejo.precio)}
            </p>
            {espejo.estado !== "DISPONIBLE" && (
              <Badge
                variant={espejo.estado === "VENDIDO" ? "destructive" : "accent"}
              >
                {espejo.estado === "VENDIDO" ? "Vendido" : "Reservado"}
              </Badge>
            )}
          </div>

          {espejo.descripcion && (
            <p className="mt-6 font-editorial text-lg leading-relaxed text-negro/80">
              {espejo.descripcion}
            </p>
          )}

          <dl className="mt-8 space-y-3 border-t border-arena pt-6 text-sm">
            {espejo.ancho && espejo.alto && (
              <div className="flex items-center gap-3">
                <Ruler className="h-4 w-4 text-madera" />
                <dt className="w-24 text-muted-foreground">Medidas</dt>
                <dd>
                  {espejo.ancho} × {espejo.alto} cm
                </dd>
              </div>
            )}
            {espejo.madera && (
              <div className="flex items-center gap-3">
                <TreePine className="h-4 w-4 text-madera" />
                <dt className="w-24 text-muted-foreground">Madera</dt>
                <dd>{espejo.madera}</dd>
              </div>
            )}
            {espejo.patina && (
              <div className="flex items-center gap-3">
                <Paintbrush className="h-4 w-4 text-madera" />
                <dt className="w-24 text-muted-foreground">Pátina</dt>
                <dd>{espejo.patina}</dd>
              </div>
            )}
            {espejo.tallado && (
              <div className="flex items-center gap-3">
                <Paintbrush className="h-4 w-4 text-madera" />
                <dt className="w-24 text-muted-foreground">Tallado</dt>
                <dd>{espejo.tallado}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink(mensajeWA)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="w-full sm:w-auto">
                Consultar por WhatsApp
              </Button>
            </a>
            <Link href="/configurador">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Quiero uno parecido a medida
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Pieza única hecha a mano en Bahía Blanca. Los tonos de madera y
            pátina pueden variar levemente respecto de las fotos.
          </p>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl uppercase text-espresso">
            También te pueden gustar
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relacionados.map((e) => (
              <EspejoCard key={e.slug} espejo={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
