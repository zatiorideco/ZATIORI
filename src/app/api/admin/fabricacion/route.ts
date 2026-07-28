import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson, withApi } from "@/lib/api-auth";

const esquemaNuevo = z.object({
  descripcion: z.string().min(3).max(300),
  alto: z.number().int().min(1).max(500).nullable().optional(),
  ancho: z.number().int().min(1).max(500).nullable().optional(),
  prioridad: z.enum(["BAJA", "MEDIA", "ALTA"]).default("MEDIA"),
  notasProduccion: z.string().max(2000).optional().or(z.literal("")),
});

/** Crear espejo para stock: entra PARA_FABRICAR sin cliente. */
async function handlerPOST(req: Request) {
  const { error } = await guard("ADMIN", "VENTAS", "FABRICA");
  if (error) return error;

  const parseado = esquemaNuevo.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");
  const d = parseado.data;

  const fabricacion = await prisma.espejoFabricacion.create({
    data: {
      estado: "PARA_FABRICAR",
      descripcion: d.descripcion,
      alto: d.alto ?? null,
      ancho: d.ancho ?? null,
      prioridad: d.prioridad,
      notasProduccion: d.notasProduccion || null,
    },
  });
  return NextResponse.json(fabricacion, { status: 201 });
}

export const POST = withApi(handlerPOST);
