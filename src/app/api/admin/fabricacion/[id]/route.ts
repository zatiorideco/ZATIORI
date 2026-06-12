import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";
import {
  esClienteZatiori,
  pasarACatalogo,
  sincronizarPedidoDesdeFabrica,
} from "@/lib/fabrica";

const esquemaPatch = z.object({
  // TERMINADO_AUTO aplica el auto-ruteo: cliente → TERMINADO_CLIENTE, sin cliente o ZATIORI → TERMINADO_STOCK
  estado: z
    .enum([
      "PARA_FABRICAR",
      "EN_FABRICACION",
      "TERMINADO_CLIENTE",
      "TERMINADO_STOCK",
      "TERMINADO_AUTO",
    ])
    .optional(),
  prioridad: z.enum(["BAJA", "MEDIA", "ALTA"]).optional(),
  responsableId: z.string().nullable().optional(),
  notasProduccion: z.string().max(2000).nullable().optional(),
  fotos: z.array(z.string()).max(12).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS", "FABRICA");
  if (error) return error;

  const parseado = esquemaPatch.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");
  const d = parseado.data;

  const actual = await prisma.espejoFabricacion.findUnique({
    where: { id: params.id },
    include: { cliente: { select: { nombre: true } } },
  });
  if (!actual) return errorJson("No encontrado", 404);

  const esZatiori = esClienteZatiori(actual.cliente?.nombre);

  // Auto-ruteo al terminar; los pedidos ZATIORI son stock propio
  let estado = d.estado;
  if (estado === "TERMINADO_AUTO") {
    estado = actual.clienteId && !esZatiori ? "TERMINADO_CLIENTE" : "TERMINADO_STOCK";
  } else if (estado === "TERMINADO_CLIENTE" && esZatiori) {
    estado = "TERMINADO_STOCK";
  }

  const esTerminado =
    estado === "TERMINADO_CLIENTE" || estado === "TERMINADO_STOCK";

  const fabricacion = await prisma.espejoFabricacion.update({
    where: { id: params.id },
    data: {
      ...(estado && { estado }),
      // Fechas automáticas del taller
      ...(estado === "EN_FABRICACION" &&
        !actual.fechaInicio && { fechaInicio: new Date() }),
      ...(esTerminado && !actual.fechaFin && { fechaFin: new Date() }),
      ...(estado && !esTerminado && { fechaFin: null }),
      ...(d.prioridad && { prioridad: d.prioridad }),
      ...(d.responsableId !== undefined && { responsableId: d.responsableId }),
      ...(d.notasProduccion !== undefined && {
        notasProduccion: d.notasProduccion,
      }),
      ...(d.fotos && { fotos: d.fotos }),
    },
  });

  let aCatalogo = false;
  if (estado) {
    // El pedido acompaña el movimiento del pipeline
    await sincronizarPedidoDesdeFabrica(fabricacion, estado);
    // Stock propio terminado: entra solo al catálogo
    if (estado === "TERMINADO_STOCK" && !fabricacion.espejoCatalogoId) {
      await pasarACatalogo(fabricacion);
      aCatalogo = true;
    }
  }

  return NextResponse.json({ ok: true, estado: fabricacion.estado, aCatalogo });
}
