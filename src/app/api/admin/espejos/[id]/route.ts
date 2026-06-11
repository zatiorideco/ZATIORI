import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";

const esquemaPatch = z.object({
  nombre: z.string().min(2).max(100).optional(),
  descripcion: z.string().max(2000).nullable().optional(),
  tipoMarco: z.string().max(50).nullable().optional(),
  alto: z.number().int().min(1).max(500).nullable().optional(),
  ancho: z.number().int().min(1).max(500).nullable().optional(),
  madera: z.string().max(100).nullable().optional(),
  patina: z.string().max(100).nullable().optional(),
  tallado: z.string().max(100).nullable().optional(),
  proveedorId: z.string().nullable().optional(),
  precio: z.number().min(0).optional(),
  fotos: z.array(z.string()).max(12).optional(),
  estado: z.enum(["DISPONIBLE", "RESERVADO", "VENDIDO"]).optional(),
  esStock: z.boolean().optional(),
  publicadoWeb: z.boolean().optional(),
  destacado: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const parseado = esquemaPatch.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");

  try {
    const espejo = await prisma.espejoCatalogo.update({
      where: { id: params.id },
      data: parseado.data,
    });
    return NextResponse.json(espejo);
  } catch {
    return errorJson("Espejo no encontrado", 404);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN");
  if (error) return error;

  try {
    await prisma.espejoCatalogo.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return errorJson(
      "No se pudo borrar (puede tener pedidos asociados). Probá despublicarlo.",
      409
    );
  }
}
