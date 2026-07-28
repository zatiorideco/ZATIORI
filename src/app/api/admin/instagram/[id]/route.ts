import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson, withApi } from "@/lib/api-auth";

const esquemaPatch = z.object({
  caption: z.string().min(1).max(2200).optional(),
  imagenes: z.array(z.string()).min(1).max(10).optional(),
  fechaProgramada: z.string().datetime().nullable().optional(),
});

async function handlerPATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const pub = await prisma.publicacionInstagram.findUnique({
    where: { id: params.id },
  });
  if (!pub) return errorJson("Publicación no encontrada", 404);
  if (pub.estado === "PUBLICADA") {
    return errorJson("Una publicación ya subida a Instagram no se edita desde acá.");
  }

  const parseado = esquemaPatch.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");
  const d = parseado.data;

  const actualizada = await prisma.publicacionInstagram.update({
    where: { id: params.id },
    data: {
      ...(d.caption && { caption: d.caption }),
      ...(d.imagenes && { imagenes: d.imagenes }),
      ...(d.fechaProgramada !== undefined && {
        fechaProgramada: d.fechaProgramada ? new Date(d.fechaProgramada) : null,
        estado: d.fechaProgramada ? "PROGRAMADA" : "BORRADOR",
      }),
    },
  });
  return NextResponse.json(actualizada);
}

async function handlerDELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const pub = await prisma.publicacionInstagram.findUnique({
    where: { id: params.id },
  });
  if (!pub) return errorJson("No encontrada", 404);
  if (pub.estado === "PUBLICADA") {
    return errorJson("No se borra una publicación que ya está en Instagram.");
  }
  await prisma.publicacionInstagram.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

export const PATCH = withApi(handlerPATCH);
export const DELETE = withApi(handlerDELETE);
