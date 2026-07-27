import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";

const esquemaPatch = z.object({
  descripcion: z.string().min(1).max(500).optional(),
  alto: z.number().int().min(1).max(500).nullable().optional(),
  ancho: z.number().int().min(1).max(500).nullable().optional(),
  cantidad: z.number().int().min(1).max(50).optional(),
  precioUnitario: z.number().min(0).optional(),
  notas: z.string().max(1000).nullable().optional(),
});

/** Editar un ítem del pedido y recalcular el pedido. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const parseado = esquemaPatch.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");
  const d = parseado.data;

  const item = await prisma.itemPedido.findUnique({
    where: { id: params.id },
    select: { id: true, pedidoId: true },
  });
  if (!item) return errorJson("Ítem no encontrado", 404);

  await prisma.itemPedido.update({
    where: { id: params.id },
    data: {
      ...(d.descripcion !== undefined && { descripcion: d.descripcion }),
      ...(d.alto !== undefined && { alto: d.alto }),
      ...(d.ancho !== undefined && { ancho: d.ancho }),
      ...(d.cantidad !== undefined && { cantidad: d.cantidad }),
      ...(d.precioUnitario !== undefined && { precioUnitario: d.precioUnitario }),
      ...(d.notas !== undefined && { notas: d.notas }),
    },
  });

  // Recalcular el pedido a partir de la suma de sus ítems
  const pedido = await prisma.pedido.findUnique({
    where: { id: item.pedidoId },
    include: { items: { select: { precioUnitario: true, cantidad: true } } },
  });
  if (pedido) {
    const subtotal = pedido.items.reduce(
      (s, i) => s + Number(i.precioUnitario) * i.cantidad,
      0
    );
    const total = Math.max(subtotal - Number(pedido.descuento), 0);
    const saldo = Math.max(total - Number(pedido.sena), 0);
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: { subtotal, total, saldo },
    });

    // Reflejar medidas/descripción en la orden de fábrica del ítem
    await prisma.espejoFabricacion.updateMany({
      where: { pedidoItemId: item.id },
      data: {
        ...(d.alto !== undefined && { alto: d.alto }),
        ...(d.ancho !== undefined && { ancho: d.ancho }),
        ...(d.descripcion !== undefined && {
          descripcion: `${pedido.numero} · ${d.descripcion}`,
        }),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
