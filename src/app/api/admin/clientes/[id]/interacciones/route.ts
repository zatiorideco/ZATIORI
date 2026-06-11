import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";

const esquema = z.object({
  tipo: z.enum(["NOTA", "LLAMADA", "WHATSAPP", "VISITA", "EMAIL"]),
  contenido: z.string().min(1).max(2000),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { session, error } = await guard("ADMIN", "VENTAS");
  if (error) return error;

  const parseado = esquema.safeParse(await req.json().catch(() => null));
  if (!parseado.success) return errorJson("Datos inválidos");

  const interaccion = await prisma.interaccionCliente.create({
    data: {
      clienteId: params.id,
      tipo: parseado.data.tipo,
      contenido: parseado.data.contenido,
      usuarioId: session.user.id,
    },
  });
  return NextResponse.json(interaccion, { status: 201 });
}
