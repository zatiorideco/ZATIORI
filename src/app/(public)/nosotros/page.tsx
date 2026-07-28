import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTextosNegocio } from "@/lib/catalogo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Zatiori es un almacén de espejos artesanal de Bahía Blanca. Conocé nuestro taller y nuestra forma de trabajar la madera.",
};

export const revalidate = 300;

const TEXTO_DEFAULT = `Zatiori nace en Bahía Blanca de una idea simple: un espejo no es solo un objeto útil, es la pieza que le cambia la luz a una casa.

En nuestro taller trabajamos con maderas nuevas seleccionadas y con maderas recicladas que rescatamos de demoliciones, campos y carpinterías. Cada marco se corta, se lija, se talla y se patina a mano. Por eso no hay dos espejos iguales: cada pieza tiene sus vetas, sus marcas y su historia.

Hacemos espejos de stock que podés ver en el catálogo, y espejos a medida: nos decís las medidas, elegís la madera, la pátina y el tallado, y lo fabricamos para vos.`;

export default async function NosotrosPage() {
  const config = await getTextosNegocio();
  const texto = config?.textoNosotros?.trim() || TEXTO_DEFAULT;

  return (
    <div className="container py-12">
      <p className="font-editorial italic text-madera">Nuestro taller</p>
      <h1 className="mt-2 font-display text-4xl uppercase text-espresso md:text-5xl">
        Nosotros
      </h1>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-2">
        <div className="space-y-5 font-editorial text-lg leading-relaxed text-negro/85">
          {texto.split("\n\n").map((parrafo, i) => (
            <p key={i}>{parrafo}</p>
          ))}
          <div className="pt-4">
            <Link href="/configurador">
              <Button size="lg">Diseñá tu espejo a medida</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-md">
            <Image
              src="/espejos/7.jpg"
              alt="Espejo con maderas recuperadas"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          </div>
          <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-lg shadow-md">
            <Image
              src="/espejos/2.jpg"
              alt="Marco texturado artesanal"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
