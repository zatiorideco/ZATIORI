import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { FabricaBoard } from "@/components/panel/FabricaBoard";

export const dynamic = "force-dynamic";

export default async function FabricaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/panel/fabrica");

  const [fabricaciones, usuarios] = await Promise.all([
    prisma.espejoFabricacion.findMany({
      orderBy: [{ prioridad: "desc" }, { createdAt: "asc" }],
      take: 400,
      include: {
        cliente: { select: { nombre: true } },
        responsable: { select: { id: true, nombre: true } },
        pedidoItem: {
          select: { pedido: { select: { numero: true, fechaEstimada: true } } },
        },
      },
    }),
    prisma.usuario.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return (
    <FabricaBoard
      puedePasarACatalogo={session.user.rol !== "FABRICA"}
      usuarios={usuarios}
      items={fabricaciones.map((f) => ({
        id: f.id,
        estado: f.estado,
        descripcion: f.descripcion,
        prioridad: f.prioridad,
        cliente: f.cliente?.nombre ?? null,
        responsableId: f.responsable?.id ?? null,
        responsable: f.responsable?.nombre ?? null,
        pedidoNumero: f.pedidoItem?.pedido.numero ?? null,
        fechaEstimada:
          f.pedidoItem?.pedido.fechaEstimada?.toISOString() ?? null,
        medidas: f.ancho && f.alto ? `${f.ancho} × ${f.alto} cm` : null,
        enCatalogo: !!f.espejoCatalogoId,
        creado: f.createdAt.toISOString(),
      }))}
    />
  );
}
