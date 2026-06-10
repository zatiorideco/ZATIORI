import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hammer, Sparkles, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EspejoCard } from "@/components/public/EspejoCard";
import { getDestacados } from "@/lib/catalogo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const destacados = await getDestacados();
  return (
    <>
      {/* Hero */}
      <section className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="font-editorial italic text-madera">
            Almacén de espejos · Bahía Blanca
          </p>
          <h1 className="mt-4 font-display text-5xl uppercase leading-tight text-espresso md:text-7xl">
            Espejos con alma de madera
          </h1>
          <p className="mt-6 max-w-md font-editorial text-lg text-negro/80">
            Piezas únicas, hechas a mano con maderas nuevas y recicladas,
            pátinas y tallados. Nada de producción en serie.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/catalogo">
              <Button size="lg">
                Ver catálogo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/configurador">
              <Button size="lg" variant="outline">
                Diseñá el tuyo
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-xl">
          <Image
            src="/espejos/1.jpg"
            alt="Espejo artesanal Zatiori con marco de madera"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* Diferenciales */}
      <section className="bg-arena/40 py-16">
        <div className="container grid gap-8 md:grid-cols-3">
          {[
            {
              icono: TreePine,
              titulo: "Madera con historia",
              texto:
                "Trabajamos con madera nueva seleccionada y maderas recicladas recuperadas de demoliciones y campos.",
            },
            {
              icono: Hammer,
              titulo: "Hecho a mano",
              texto:
                "Cada marco se corta, talla y patina en nuestro taller de Bahía Blanca. No hay dos espejos iguales.",
            },
            {
              icono: Sparkles,
              titulo: "A tu medida",
              texto:
                "Elegís medidas, madera, pátina y tallado con nuestro configurador, y lo fabricamos para vos.",
            },
          ].map((d) => (
            <div key={d.titulo} className="text-center md:text-left">
              <d.icono className="mx-auto h-8 w-8 text-madera md:mx-0" />
              <h3 className="mt-4 font-display text-xl uppercase tracking-wide text-espresso">
                {d.titulo}
              </h3>
              <p className="mt-2 text-sm text-negro/75">{d.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Destacados */}
      {destacados.length > 0 && (
        <section className="container py-16">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-editorial italic text-madera">
                Listos para llevar
              </p>
              <h2 className="mt-2 font-display text-3xl uppercase text-espresso md:text-4xl">
                Espejos destacados
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="hidden items-center gap-1 text-sm uppercase tracking-wider text-espresso hover:text-madera md:flex"
            >
              Ver todo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((e) => (
              <EspejoCard key={e.slug} espejo={e} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link href="/catalogo">
              <Button variant="outline">Ver todo el catálogo</Button>
            </Link>
          </div>
        </section>
      )}

      {/* CTA a medida */}
      <section className="bg-espresso py-16 text-crema">
        <div className="container text-center">
          <h2 className="font-display text-3xl uppercase md:text-4xl">
            ¿No encontraste el tuyo?
          </h2>
          <p className="mx-auto mt-4 max-w-md font-editorial text-lg text-arena">
            Lo hacemos a medida: vos elegís las medidas, la madera, la pátina y
            el tallado.
          </p>
          <Link href="/configurador" className="mt-8 inline-block">
            <Button size="lg" variant="accent">
              Diseñá tu espejo <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
