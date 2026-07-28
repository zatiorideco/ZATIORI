import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson, withApi } from "@/lib/api-auth";

const esquemaPatch = z.object({
  tipo: z.enum(["MADERA", "ESPEJO", "INSUMO", "HERRAJE"]).optional(),
  nombre: z.string().min(2).max(100).optional(),
  contacto: z.string().max(100).nullable().optional(),
  telefono: z.string().max(30).nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("").transform(() => null)),
  direccion: z.string().max(200).nullable().optional(),
  notas: z.string().max(2000).nullable().optional(),
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
    const proveedor = await prisma.proveedor.update({
      where: { id: params.id },
      data: parseado.data,
    });
    return NextResponse.json(proveedor);
  } catch {
    return errorJson("Proveedor no encontrado", 404);
  }
}

async function handlerDELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN");
  if (error) return error;

  try {
    await prisma.proveedor.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return errorJson("No se pudo borrar el proveedor.", 409);
  }
}

export const PATCH = withApi(handlerPATCH);
export const DELETE = withApi(handlerDELETE);
