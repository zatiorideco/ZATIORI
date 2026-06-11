import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";

const esquemaPatch = z.object({
  estado: z
    .enum([
      "PRESUPUESTO",
      "CONFIRMADO",
      "EN_FABRICACION",
      "TERMINADO",
      "ENTREGADO",
      "CANCELADO",
    ])
    .optional(),
  descuento: z.number().min(0).optional(),
  sena: z.number().min(0).optional(),
  fechaEstimada: z.string().datetime().nullable().optional(),
  notas: z.string().max(2000).nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const parseado = esquemaPatch.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");
  const d = parseado.data;

  const actual = await prisma.pedido.findUnique({ where: { id: params.id } });
  if (!actual) return errorJson("Pedido no encontrado", 404);

  // Recalcular total y saldo si cambian descuento o seña
  const subtotal = Number(actual.subtotal);
  const descuento = d.descuento ?? Number(actual.descuento);
  const sena = d.sena ?? Number(actual.sena);
  const total = Math.max(subtotal - descuento, 0);
  const saldo = Math.max(total - sena, 0);

  const pedido = await prisma.pedido.update({
    where: { id: params.id },
    data: {
      ...(d.estado && { estado: d.estado }),
      descuento,
      sena,
      total,
      saldo,
      ...(d.fechaEstimada !== undefined && {
        fechaEstimada: d.fechaEstimada ? new Date(d.fechaEstimada) : null,
      }),
      ...(d.notas !== undefined && { notas: d.notas }),
    },
  });
  return NextResponse.json({ ok: true, id: pedido.id });
}
