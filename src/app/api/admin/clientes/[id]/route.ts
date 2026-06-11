import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard, errorJson } from "@/lib/api-auth";

const esquemaPatch = z.object({
  nombre: z.string().min(2).max(100).optional(),
  telefono: z.string().max(30).nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("").transform(() => null)),
  direccion: z.string().max(200).nullable().optional(),
  ciudad: z.string().max(100).nullable().optional(),
  origen: z.enum(["WEB", "INSTAGRAM", "LOCAL", "REFERIDO", "WHATSAPP"]).optional(),
  notas: z.string().max(2000).nullable().optional(),
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
    const cliente = await prisma.cliente.update({
      where: { id: params.id },
      data: parseado.data,
    });
    return NextResponse.json(cliente);
  } catch {
    return errorJson("Cliente no encontrado", 404);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await guard("ADMIN");
  if (error) return error;

  try {
    await prisma.cliente.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return errorJson(
      "No se puede borrar: el cliente tiene pedidos asociados.",
      409
    );
  }
}
