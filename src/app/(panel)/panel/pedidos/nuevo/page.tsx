import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRol } from "@/lib/auth";
import { NuevoPedidoForm } from "@/components/panel/NuevoPedidoForm";

export const dynamic = "force-dynamic";

export default async function NuevoPedidoPage({
  searchParams,
}: {
  searchParams: { espejo?: string };
}) {
  const session = await requireRol("ADMIN", "VENTAS");
  if (!session) redirect("/panel");

  // ¿Viene desde el catálogo? Pre-cargamos el espejo
  const espejo = searchParams.espejo
    ? await prisma.espejoCatalogo.findUnique({
        where: { id: searchParams.espejo },
        select: { id: true, nombre: true, ancho: true, alto: true, precio: true, madera: true, patina: true },
      })
    : null;

  return (
    <NuevoPedidoForm
      espejo={
        espejo
          ? {
              id: espejo.id,
              nombre: espejo.nombre,
              ancho: espejo.ancho,
              alto: espejo.alto,
              precio: Number(espejo.precio),
              detalle: [espejo.nombre, espejo.madera, espejo.patina]
                .filter(Boolean)
                .join(" — "),
            }
          : null
      }
    />
  );
}
