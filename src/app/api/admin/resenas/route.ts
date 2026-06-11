import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";
import { SITE_URL } from "@/lib/constants";

/** Crear invitación de reseña para un cliente (o reusar la pendiente). */
export async function POST(req: Request) {
  const { error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const parseado = z
    .object({ clienteId: z.string().min(1) })
    .safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");

  const cliente = await prisma.cliente.findUnique({
    where: { id: parseado.data.clienteId },
  });
  if (!cliente) return errorJson("Cliente no encontrado", 404);

  const pendiente = await prisma.resena.findFirst({
    where: { clienteId: cliente.id, texto: "" },
  });
  const resena =
    pendiente ??
    (await prisma.resena.create({
      data: {
        clienteId: cliente.id,
        nombre: cliente.nombre,
        rating: 5,
        texto: "",
      },
    }));

  return NextResponse.json({
    token: resena.token,
    url: `${SITE_URL}/resena/${resena.token}`,
  });
}
