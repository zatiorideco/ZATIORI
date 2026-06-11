import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";
import { PedidoPDF } from "@/lib/pdf/PedidoPDF";
import { NEGOCIO } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS", "FABRICA");
  if (error) return error;

  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: {
      cliente: true,
      items: {
        include: {
          maderaOpcion: true,
          patinaOpcion: true,
          talladoOpcion: true,
        },
      },
    },
  });
  if (!pedido) return errorJson("Pedido no encontrado", 404);

  const config = await prisma.configuracion.findUnique({
    where: { id: "singleton" },
  });

  const buffer = await renderToBuffer(
    PedidoPDF({
      datos: {
        numero: pedido.numero,
        fecha: pedido.createdAt,
        estado: pedido.estado.replace("_", " "),
        cliente: {
          nombre: pedido.cliente.nombre,
          telefono: pedido.cliente.telefono,
          email: pedido.cliente.email,
          ciudad: pedido.cliente.ciudad,
        },
        items: pedido.items.map((item) => ({
          descripcion: item.descripcion,
          medidas:
            item.ancho && item.alto ? `${item.ancho} × ${item.alto} cm` : null,
          madera: item.maderaOpcion?.nombre ?? null,
          patina: item.patinaOpcion?.nombre ?? null,
          tallado: item.talladoOpcion?.nombre ?? null,
          extras: Array.isArray(item.extras)
            ? (item.extras as Array<{ nombre?: string }>)
                .map((e) => e.nombre)
                .filter((n): n is string => !!n)
            : [],
          cantidad: item.cantidad,
          precioUnitario: Number(item.precioUnitario),
        })),
        subtotal: Number(pedido.subtotal),
        descuento: Number(pedido.descuento),
        total: Number(pedido.total),
        sena: Number(pedido.sena),
        saldo: Number(pedido.saldo),
        fechaEstimada: pedido.fechaEstimada,
        notas: pedido.notas,
        negocio: {
          whatsapp: config?.whatsapp ?? NEGOCIO.whatsapp,
          instagram: config?.instagram ?? "zatiori",
          email: config?.emailContacto ?? null,
          direccion: config?.direccion ?? null,
        },
      },
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pedido-${pedido.numero}.pdf"`,
    },
  });
}
