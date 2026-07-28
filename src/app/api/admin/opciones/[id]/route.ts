import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson, withApi } from "@/lib/api-auth";

const esquemaPatch = z.object({
  nombre: z.string().min(1).max(100).optional(),
  descripcion: z.string().max(300).nullable().optional(),
  precioAdicional: z.number().min(0).optional(),
  orden: z.number().int().min(0).optional(),
  activo: z.boolean().optional(),
});

async function handlerPATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN");
  if (error) return error;

  const parseado = esquemaPatch.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");

  try {
    const opcion = await prisma.opcionConfigurador.update({
      where: { id: params.id },
      data: parseado.data,
    });
    return NextResponse.json(opcion);
  } catch {
    return errorJson("Opción no encontrada", 404);
  }
}

async function handlerDELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN");
  if (error) return error;

  try {
    await prisma.opcionConfigurador.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return errorJson(
      "No se puede borrar: hay pedidos que la usan. Desactivala en su lugar.",
      409
    );
  }
}

export const PATCH = withApi(handlerPATCH);
export const DELETE = withApi(handlerDELETE);
