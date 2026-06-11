import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";

const esquema = z.object({
  espejoCatalogoId: z.string().nullable().optional(),
  espejoFabricacionId: z.string().nullable().optional(),
  caption: z.string().min(1).max(2200),
  imagenes: z.array(z.string()).min(1).max(10),
  fechaProgramada: z.string().datetime().nullable().optional(),
});

/** Crear publicación: SIEMPRE entra como BORRADOR (o PROGRAMADA si tiene fecha).
 *  Publicar de verdad requiere el POST /publicar explícito. */
export async function POST(req: Request) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const parseado = esquema.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");
  const d = parseado.data;

  const publicacion = await prisma.publicacionInstagram.create({
    data: {
      espejoCatalogoId: d.espejoCatalogoId ?? null,
      espejoFabricacionId: d.espejoFabricacionId ?? null,
      caption: d.caption,
      imagenes: d.imagenes,
      fechaProgramada: d.fechaProgramada ? new Date(d.fechaProgramada) : null,
      estado: d.fechaProgramada ? "PROGRAMADA" : "BORRADOR",
    },
  });
  return NextResponse.json(publicacion, { status: 201 });
}
