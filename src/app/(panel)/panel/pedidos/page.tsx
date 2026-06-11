import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatARS, fechaAR, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { EstadoPedido, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const ESTADOS: Array<{ valor: EstadoPedido | "TODOS"; label: string }> = [
  { valor: "TODOS", label: "Todos" },
  { valor: "PRESUPUESTO", label: "Presupuestos" },
  { valor: "CONFIRMADO", label: "Confirmados" },
  { valor: "EN_FABRICACION", label: "En fabricación" },
  { valor: "TERMINADO", label: "Terminados" },
  { valor: "ENTREGADO", label: "Entregados" },
  { valor: "CANCELADO", label: "Cancelados" },
];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: { estado?: string; q?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/panel/pedidos");

  const estado = ESTADOS.find((e) => e.valor === searchParams.estado)?.valor;
  const q = searchParams.q?.trim();

  const where: Prisma.PedidoWhereInput = {
    ...(estado && estado !== "TODOS" ? { estado } : {}),
    ...(q
      ? {
          OR: [
            { numero: { contains: q, mode: "insensitive" } },
            { cliente: { nombre: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const pedidos = await prisma.pedido.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      cliente: { select: { nombre: true } },
      items: { select: { id: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl uppercase text-espresso">Pedidos</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {ESTADOS.map((e) => (
          <Link
            key={e.valor}
            href={
              e.valor === "TODOS"
                ? "/panel/pedidos"
                : `/panel/pedidos?estado=${e.valor}`
            }
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              (estado ?? "TODOS") === e.valor
                ? "border-espresso bg-espresso text-crema"
                : "border-arena bg-card hover:border-madera"
            )}
          >
            {e.label}
          </Link>
        ))}
      </div>

      <form className="mt-4 max-w-sm">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por número o cliente… (Enter)"
          className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {estado && estado !== "TODOS" && (
          <input type="hidden" name="estado" value={estado} />
        )}
      </form>

      {pedidos.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          No hay pedidos con ese filtro.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-arena bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Saldo</th>
                <th className="px-4 py-3">Entrega</th>
                <th className="px-4 py-3">Creado</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-arena/50 transition-colors last:border-0 hover:bg-arena/30"
                >
                  <td className="px-4 py-3 font-medium text-espresso">
                    <Link
                      href={`/panel/pedidos/${p.id}`}
                      className="hover:underline"
                    >
                      {p.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.cliente.nombre}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {p.estado.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">{p.items.length}</td>
                  <td className="px-4 py-3 text-right">
                    {formatARS(Number(p.total))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {Number(p.saldo) > 0 ? (
                      <span className="text-warn">
                        {formatARS(Number(p.saldo))}
                      </span>
                    ) : (
                      <span className="text-ok">Pagado</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.fechaEstimada ? fechaAR(p.fechaEstimada) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {fechaAR(p.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
