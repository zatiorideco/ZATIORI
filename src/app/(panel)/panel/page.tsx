import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  Package,
  Hammer,
  FileText,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatARS, fechaAR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

const ESTADO_PEDIDO_LABEL: Record<string, string> = {
  SIN_PRESUPUESTAR: "Sin presupuestar",
  PRESUPUESTADO: "Presupuestado",
  PARA_FABRICAR: "Para fabricar",
  EN_FABRICACION: "En fabricación",
  PARA_ENTREGAR: "Para entregar",
  ENTREGADO: "Entregado",
};

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user.rol === "FABRICA") redirect("/panel/fabrica");

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [
    pedidosPorEstado,
    ventasMes,
    clientesTotal,
    clientesNuevosMes,
    fabricacionPendiente,
    espejosDisponibles,
    ultimosPedidos,
  ] = await Promise.all([
    prisma.pedido.groupBy({ by: ["estado"], _count: true }),
    prisma.pedido.aggregate({
      _sum: { total: true },
      where: {
        estado: { in: ["PARA_FABRICAR", "EN_FABRICACION", "PARA_ENTREGAR", "ENTREGADO"] },
        createdAt: { gte: inicioMes },
      },
    }),
    prisma.cliente.count(),
    prisma.cliente.count({ where: { createdAt: { gte: inicioMes } } }),
    prisma.espejoFabricacion.count({
      where: { estado: { in: ["PARA_FABRICAR", "EN_FABRICACION"] } },
    }),
    prisma.espejoCatalogo.count({
      where: { estado: "DISPONIBLE", publicadoWeb: true },
    }),
    prisma.pedido.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { cliente: { select: { nombre: true } } },
    }),
  ]);

  const contarEstado = (estado: string) =>
    pedidosPorEstado.find((p) => p.estado === estado)?._count ?? 0;
  const pedidosActivos =
    contarEstado("SIN_PRESUPUESTAR") +
    contarEstado("PRESUPUESTADO") +
    contarEstado("PARA_FABRICAR") +
    contarEstado("EN_FABRICACION") +
    contarEstado("PARA_ENTREGAR");

  const kpis = [
    {
      titulo: "Ventas del mes",
      valor: formatARS(Number(ventasMes._sum.total ?? 0)),
      detalle: "pedidos confirmados o más",
      icono: TrendingUp,
    },
    {
      titulo: "Pedidos activos",
      valor: String(pedidosActivos),
      detalle: `${contarEstado("SIN_PRESUPUESTAR")} sin presupuestar`,
      icono: FileText,
    },
    {
      titulo: "En el taller",
      valor: String(fabricacionPendiente),
      detalle: "espejos para fabricar o en proceso",
      icono: Hammer,
    },
    {
      titulo: "Clientes",
      valor: String(clientesTotal),
      detalle: `${clientesNuevosMes} nuevos este mes`,
      icono: Users,
    },
    {
      titulo: "Catálogo online",
      valor: String(espejosDisponibles),
      detalle: "espejos disponibles publicados",
      icono: Package,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl uppercase text-espresso">
        Dashboard
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.titulo}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                {k.titulo}
                <k.icono className="h-4 w-4 text-madera" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-editorial text-2xl text-espresso">{k.valor}</p>
              <p className="mt-1 text-xs text-muted-foreground">{k.detalle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl uppercase text-espresso">
            Últimos pedidos
          </h2>
          <span className="text-xs text-muted-foreground">
            El detalle de pedidos llega en la Fase 5
          </span>
        </div>
        {ultimosPedidos.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Todavía no hay pedidos. Cuando alguien use el configurador de la
            web, aparecen acá.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-arena bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Número</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ultimosPedidos.map((p) => (
                  <tr key={p.id} className="border-b border-arena/50 last:border-0">
                    <td className="px-4 py-3 font-medium text-espresso">
                      {p.numero}
                    </td>
                    <td className="px-4 py-3">{p.cliente.nombre}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {ESTADO_PEDIDO_LABEL[p.estado] ?? p.estado}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatARS(Number(p.total))}
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

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/panel/clientes"
          className="inline-flex items-center gap-1 text-sm text-madera hover:underline"
        >
          Ir a clientes <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href="/panel/catalogo"
          className="inline-flex items-center gap-1 text-sm text-madera hover:underline"
        >
          Ir al catálogo <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
