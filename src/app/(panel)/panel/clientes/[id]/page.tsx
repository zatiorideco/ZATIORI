import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRol } from "@/lib/auth";
import { formatARS, fechaAR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { OrigenBadge } from "@/components/panel/OrigenBadge";
import { ClienteAcciones } from "@/components/panel/ClienteAcciones";
import { Timeline } from "@/components/panel/Timeline";

export const dynamic = "force-dynamic";

export default async function ClienteDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireRol("ADMIN", "VENTAS");
  if (!session) redirect("/panel");

  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      pedidos: { orderBy: { createdAt: "desc" } },
      interacciones: {
        orderBy: { fecha: "desc" },
        take: 50,
        include: { usuario: { select: { nombre: true } } },
      },
      fabricaciones: {
        where: { estado: { in: ["PARA_FABRICAR", "EN_FABRICACION"] } },
        select: { id: true },
      },
    },
  });
  if (!cliente) notFound();

  return (
    <div>
      <Link
        href="/panel/clientes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-madera"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a clientes
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase text-espresso">
            {cliente.nombre}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <OrigenBadge origen={cliente.origen} />
            {cliente.ciudad && <span>{cliente.ciudad}</span>}
            <span>· Cliente desde {fechaAR(cliente.createdAt)}</span>
            {cliente.fabricaciones.length > 0 && (
              <Badge variant="accent">
                {cliente.fabricaciones.length} en el taller
              </Badge>
            )}
          </div>
        </div>
        <ClienteAcciones
          cliente={{
            id: cliente.id,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email,
            direccion: cliente.direccion,
            ciudad: cliente.ciudad,
            origen: cliente.origen,
            notas: cliente.notas,
          }}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl uppercase text-espresso">
            Pedidos ({cliente.pedidos.length})
          </h2>
          {cliente.pedidos.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Sin pedidos todavía.
            </p>
          ) : (
            <div className="mt-3 overflow-hidden rounded-lg border border-arena bg-card">
              <table className="w-full text-sm">
                <tbody>
                  {cliente.pedidos.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-arena/50 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-espresso">
                        {p.numero}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{p.estado}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatARS(Number(p.total))}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {fechaAR(p.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {cliente.notas && (
            <div className="mt-6 rounded-lg border border-arena bg-card p-4">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
                Notas
              </h3>
              <p className="mt-1 whitespace-pre-wrap text-sm">{cliente.notas}</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-espresso">
            Timeline
          </h2>
          <Timeline
            clienteId={cliente.id}
            interacciones={cliente.interacciones.map((i) => ({
              id: i.id,
              tipo: i.tipo,
              contenido: i.contenido,
              fecha: i.fecha.toISOString(),
              usuario: i.usuario?.nombre ?? null,
            }))}
          />
        </section>
      </div>
    </div>
  );
}
