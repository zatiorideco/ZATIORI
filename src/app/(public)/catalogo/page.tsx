import type { Metadata } from "next";
import Link from "next/link";
import { getEspejosPublicados } from "@/lib/catalogo";
import { CatalogoFiltros } from "@/components/public/CatalogoFiltros";

export const metadata: Metadata = {
  title: "Catálogo de espejos",
  description:
    "Espejos artesanales disponibles: filtrá por medida, precio, madera y color. Piezas únicas con marcos de madera hechas en Bahía Blanca.",
};

export const revalidate = 300;

export default async function CatalogoPage() {
  const espejos = await getEspejosPublicados();

  return (
    <div className="container py-12">
      <p className="font-editorial italic text-madera">Piezas únicas</p>
      <h1 className="mt-2 font-display text-4xl uppercase text-espresso md:text-5xl">
        Catálogo
      </h1>
      <p className="mt-3 max-w-xl text-negro/75">
        Espejos listos para llevar. Filtrá por medida, precio, madera o color —
        y si no encontrás el tuyo,{" "}
        <Link href="/configurador" className="underline hover:text-madera">
          diseñalo a medida
        </Link>
        .
      </p>

      <CatalogoFiltros espejos={espejos} />
    </div>
  );
}
