import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson, withApi } from "@/lib/api-auth";
import { revalidarWebPublica } from "@/lib/revalidar";

const esquemaPatch = z.object({
  aprobada: z.boolean().optional(),
  publicadaWeb: z.boolean().optional(),
});

async function handlerPATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const parseado = esquemaPatch.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");

  try {
    const d = parseado.data;
    const resena = await prisma.resena.update({
      where: { id: params.id },
      data: {
        ...(d.aprobada !== undefined && { aprobada: d.aprobada }),
        ...(d.publicadaWeb !== undefined && { publicadaWeb: d.publicadaWeb }),
        // Despublicar si se desaprueba
        ...(d.aprobada === false && { publicadaWeb: false }),
      },
    });
    revalidarWebPublica();
    return NextResponse.json({ ok: true, id: resena.id });
  } catch {
    return errorJson("Reseña no encontrada", 404);
  }
}

async function handlerDELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  try {
    await prisma.resena.delete({ where: { id: params.id } });
    revalidarWebPublica();
    return NextResponse.json({ ok: true });
  } catch {
    return errorJson("Reseña no encontrada", 404);
  }
}

export const PATCH = withApi(handlerPATCH);
export const DELETE = withApi(handlerDELETE);
