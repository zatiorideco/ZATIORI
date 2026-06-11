import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errorJson } from "@/lib/api-auth";

const esquema = z.object({
  nombre: z.string().min(2).max(100),
  rating: z.number().int().min(1).max(5),
  texto: z.string().min(5).max(2000),
  fotos: z.array(z.string().url()).max(3).default([]),
});

/** Ruta pública: el cliente completa su reseña desde /resena/[token]. */
export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const resena = await prisma.resena.findUnique({
    where: { token: params.token },
  });
  if (!resena) return errorJson("Link de reseña inválido.", 404);
  if (resena.texto !== "") {
    return errorJson("Esta reseña ya fue enviada. ¡Gracias!", 409);
  }

  const parseado = esquema.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Revisá los datos de la reseña.");

  const d = parseado.data;
  await prisma.resena.update({
    where: { id: resena.id },
    data: {
      nombre: d.nombre,
      rating: d.rating,
      texto: d.texto,
      fotos: d.fotos,
      aprobada: false,
      publicadaWeb: false,
    },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
