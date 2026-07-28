import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatARS, fechaAR, waLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PedidoEditor } from "@/components/panel/PedidoEditor";
import { ItemEditor } from "@/components/panel/ItemEditor";

export const dynamic = "force-dynamic";

export default async function PedidoDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/panel/pedidos");
  const puedeEditar = session.user.rol !== "FABRICA";

  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: {
      cliente: true,
      items: {
        include: {
          maderaOpcion: { select: { nombre: true } },
          patinaOpcion: { select: { nombre: true } },
          talladoOpcion: { select: { nombre: true } },
          fabricaciones: { select: { id: true, estado: true } },
        },
      },
    },
  });
  if (!pedido) notFound();

  const waUrl = waLink(
    pedido.cliente.telefono,
    `¡Hola ${pedido.cliente.nombre.split(" ")[0]}! Te escribimos de Zatiori por tu pedido ${pedido.numero}. Total ${formatARS(Number(pedido.total))}, seña ${formatARS(Number(pedido.sena))}, saldo ${formatARS(Number(pedido.saldo))}.`
  );

  return (
    <div>
      <Link
        href="/panel/pedidos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-madera"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a pedidos
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase text-espresso">
            {pedido.numero}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cliente:{" "}
            <Link
              href={`/panel/clientes/${pedido.clienteId}`}
              className="font-medium text-espresso hover:underline"
            >
              {pedido.cliente.nombre}
            </Link>{" "}
            · creado el {fechaAR(pedido.createdAt)} · origen {pedido.origen}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/admin/pedidos/${pedido.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4" /> PDF presupuesto
            </Button>
          </a>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="accent" size="sm">
                WhatsApp al cliente
              </Button>
            </a>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-xl uppercase text-espresso">
            Detalle del pedido
          </h2>
          <div className="mt-3 space-y-3">
            {pedido.items.map((item) => (
              <ItemEditor
                key={item.id}
                puedeEditar={puedeEditar}
                item={{
                  id: item.id,
                  descripcion: item.descripcion,
                  alto: item.alto,
                  ancho: item.ancho,
                  cantidad: item.cantidad,
                  precioUnitario: Number(item.precioUnitario),
                  notas: item.notas,
                  madera: item.maderaOpcion?.nombre ?? null,
                  patina: item.patinaOpcion?.nombre ?? null,
                  tallado: item.talladoOpcion?.nombre ?? null,
                  fabricaciones: item.fabricaciones,
                }}
              />
            ))}
          </div>
        </div>

        <PedidoEditor
          puedeEditar={puedeEditar}
          pedido={{
            id: pedido.id,
            estado: pedido.estado,
            subtotal: Number(pedido.subtotal),
            descuento: Number(pedido.descuento),
            total: Number(pedido.total),
            sena: Number(pedido.sena),
            saldo: Number(pedido.saldo),
            fechaEstimada: pedido.fechaEstimada?.toISOString() ?? null,
            notas: pedido.notas,
          }}
        />
      </div>
    </div>
  );
}
