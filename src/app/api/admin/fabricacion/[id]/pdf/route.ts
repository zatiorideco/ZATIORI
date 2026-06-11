import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";
import { OrdenFabricacionPDF } from "@/lib/pdf/OrdenFabricacionPDF";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS", "FABRICA");
  if (error) return error;

  const fab = await prisma.espejoFabricacion.findUnique({
    where: { id: params.id },
    include: {
      cliente: { select: { nombre: true } },
      responsable: { select: { nombre: true } },
      pedidoItem: {
        include: { pedido: { select: { numero: true, fechaEstimada: true, notas: true } } },
      },
    },
  });
  if (!fab) return errorJson("Orden no encontrada", 404);

  const specs = (fab.especificaciones ?? {}) as {
    madera?: string | null;
    patina?: string | null;
    tallado?: string | null;
    extras?: string[];
  };

  const buffer = await renderToBuffer(
    OrdenFabricacionPDF({
      datos: {
        id: fab.id,
        pedidoNumero: fab.pedidoItem?.pedido.numero ?? null,
        descripcion: fab.descripcion,
        estado: fab.estado,
        prioridad: fab.prioridad,
        cliente: fab.cliente?.nombre ?? null,
        responsable: fab.responsable?.nombre ?? null,
        medidas:
          fab.ancho && fab.alto ? `${fab.ancho} × ${fab.alto} cm` : null,
        madera: specs.madera ?? null,
        patina: specs.patina ?? null,
        tallado: specs.tallado ?? null,
        extras: specs.extras ?? [],
        fechaCreacion: fab.createdAt,
        fechaEstimada: fab.pedidoItem?.pedido.fechaEstimada ?? null,
        notasProduccion: fab.notasProduccion,
        notasPedido: fab.pedidoItem?.pedido.notas ?? null,
      },
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orden-${fab.pedidoItem?.pedido.numero ?? "stock"}-${fab.id.slice(-6)}.pdf"`,
    },
  });
}
