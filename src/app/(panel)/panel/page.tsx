import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  Package,
  Hammer,
  FileText,
  TrendingUp,
  ArrowRight,
  Flame,
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
import { EstadisticasWeb } from "@/components/panel/EstadisticasWeb";

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
    entregasVencidas,
    resenasPorRevisar,
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
    prisma.pedido.count({
      where: {
        estado: { not: "ENTREGADO" },
        fechaEstimada: { lt: new Date() },
      },
    }),
    prisma.resena.count({
      where: { aprobada: false, texto: { not: "" } },
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
      href: "/panel/pedidos",
    },
    {
      titulo: "Pedidos activos",
      valor: String(pedidosActivos),
      detalle: `${contarEstado("SIN_PRESUPUESTAR")} sin presupuestar`,
      icono: FileText,
      href: "/panel/pedidos",
    },
    {
      titulo: "En el taller",
      valor: String(fabricacionPendiente),
      detalle: "espejos para fabricar o en proceso",
      icono: Hammer,
      href: "/panel/fabrica",
    },
    {
      titulo: "Clientes",
      valor: String(clientesTotal),
      detalle: `${clientesNuevosMes} nuevos este mes`,
      icono: Users,
      href: "/panel/clientes",
    },
    {
      titulo: "Catálogo online",
      valor: String(espejosDisponibles),
      detalle: "espejos disponibles publicados",
      icono: Package,
      href: "/panel/catalogo",
    },
  ];

  const quema = [
    {
      cantidad: contarEstado("SIN_PRESUPUESTAR"),
      label: "sin presupuestar",
      detalle: "pedidos esperando que les pongas precio",
      href: "/panel/pedidos?estado=SIN_PRESUPUESTAR",
    },
    {
      cantidad: entregasVencidas,
      label: "entregas vencidas",
      detalle: "pedidos con fecha de entrega pasada",
      href: "/panel/pedidos?vencidos=1",
    },
    {
      cantidad: resenasPorRevisar,
      label: "reseñas por revisar",
      detalle: "respuestas de clientes esperando aprobación",
      href: "/panel/resenas",
    },
  ].filter((x) => x.cantidad > 0);

  return (
    <div>
      <h1 className="font-display text-3xl uppercase text-espresso">
        Dashboard
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <Link key={k.titulo} href={k.href} className="group">
            <Card className="h-full transition-colors group-hover:border-madera">
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
          </Link>
        ))}
      </div>

      {quema.length > 0 && (
        <div className="mt-8">
          <h2 className="flex items-center gap-2 font-display text-xl uppercase text-espresso">
            <Flame className="h-5 w-5 text-destructive" /> Lo que quema
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quema.map((x) => (
              <Link
                key={x.label}
                href={x.href}
                className="group flex items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 transition-colors hover:border-destructive"
              >
                <span className="font-editorial text-3xl text-destructive">
                  {x.cantidad}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-espresso">
                    {x.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {x.detalle}
                  </span>
                </span>
                <ArrowRight className="ml-auto h-4 w-4 text-destructive opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl uppercase text-espresso">
            Últimos pedidos
          </h2>
          <Link
            href="/panel/pedidos"
            className="text-xs text-madera hover:underline"
          >
            Ver todos
          </Link>
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

      <EstadisticasWeb />

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/panel/pedidos"
          className="inline-flex items-center gap-1 text-sm text-madera hover:underline"
        >
          Ir a pedidos <ArrowRight className="h-3 w-3" />
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
