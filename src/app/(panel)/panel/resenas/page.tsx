import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRol } from "@/lib/auth";
import { ResenasLista } from "@/components/panel/ResenasLista";

export const dynamic = "force-dynamic";

export default async function ResenasPage() {
  const session = await requireRol("ADMIN", "VENTAS");
  if (!session) redirect("/panel");

  const resenas = await prisma.resena.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { cliente: { select: { id: true, nombre: true, telefono: true } } },
  });

  return (
    <ResenasLista
      resenas={resenas.map((r) => ({
        id: r.id,
        token: r.token,
        nombre: r.nombre,
        rating: r.rating,
        texto: r.texto,
        fotos: r.fotos,
        aprobada: r.aprobada,
        publicadaWeb: r.publicadaWeb,
        creada: r.createdAt.toISOString(),
        clienteId: r.cliente?.id ?? null,
        clienteTelefono: r.cliente?.telefono ?? null,
      }))}
    />
  );
}
