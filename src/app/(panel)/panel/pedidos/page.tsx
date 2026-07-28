import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PedidosLista } from "@/components/panel/PedidosLista";

export const dynamic = "force-dynamic";

const ESTADOS_VALIDOS = [
  "SIN_PRESUPUESTAR",
  "PRESUPUESTADO",
  "PARA_FABRICAR",
  "EN_FABRICACION",
  "PARA_ENTREGAR",
  "ENTREGADO",
];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: { estado?: string; vencidos?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/panel/pedidos");

  const pedidos = await prisma.pedido.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      cliente: { select: { nombre: true, telefono: true } },
      items: { select: { descripcion: true }, take: 1 },
    },
  });

  return (
    <PedidosLista
      puedeEditar={session.user.rol !== "FABRICA"}
      estadoInicial={
        searchParams.estado && ESTADOS_VALIDOS.includes(searchParams.estado)
          ? searchParams.estado
          : null
      }
      soloVencidosInicial={searchParams.vencidos === "1"}
      pedidos={pedidos.map((p) => ({
        id: p.id,
        numero: p.numero,
        cliente: p.cliente.nombre,
        telefono: p.cliente.telefono,
        detalle: p.items[0]?.descripcion ?? "—",
        estado: p.estado,
        total: Number(p.total),
        saldo: Number(p.saldo),
        fechaPedido: p.createdAt.toISOString(),
        fechaEntrega: p.fechaEstimada?.toISOString() ?? null,
      }))}
    />
  );
}
