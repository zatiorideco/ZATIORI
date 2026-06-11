import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRol } from "@/lib/auth";
import { CatalogoLista } from "@/components/panel/CatalogoLista";

export const dynamic = "force-dynamic";

export default async function CatalogoAdminPage() {
  const session = await requireRol("ADMIN", "VENTAS");
  if (!session) redirect("/panel");

  const espejos = await prisma.espejoCatalogo.findMany({
    orderBy: { updatedAt: "desc" },
    take: 300,
  });

  return (
    <CatalogoLista
      espejos={espejos.map((e) => ({
        id: e.id,
        slug: e.slug,
        nombre: e.nombre,
        tipoMarco: e.tipoMarco,
        alto: e.alto,
        ancho: e.ancho,
        precio: Number(e.precio),
        foto: e.fotos[0] ?? null,
        estado: e.estado,
        publicadoWeb: e.publicadoWeb,
        destacado: e.destacado,
      }))}
    />
  );
}
