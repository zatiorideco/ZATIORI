import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PedidosLista } from "@/components/panel/PedidosLista";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/panel/pedidos");

  const pedidos = await prisma.pedido.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      cliente: { select: { nombre: true } },
      items: { select: { descripcion: true }, take: 1 },
    },
  });

  return (
    <PedidosLista
      puedeEditar={session.user.rol !== "FABRICA"}
      pedidos={pedidos.map((p) => ({
        id: p.id,
        numero: p.numero,
        cliente: p.cliente.nombre,
        detalle: p.items[0]?.descripcion ?? "—",
        estado: p.estado,
        total: Number(p.total),
        fechaPedido: p.createdAt.toISOString(),
        fechaEntrega: p.fechaEstimada?.toISOString() ?? null,
      }))}
    />
  );
}
