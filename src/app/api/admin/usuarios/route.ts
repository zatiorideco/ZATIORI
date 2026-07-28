import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { guard, errorJson, withApi } from "@/lib/api-auth";

const esquema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  rol: z.enum(["ADMIN", "VENTAS", "FABRICA"]),
});

async function handlerPOST(req: Request) {
  const { error } = await guard("ADMIN");
  if (error) return error;

  const parseado = esquema.safeParse(await req.json().catch(() => null));
  if (!parseado.success) {
    return errorJson("Datos inválidos (la contraseña necesita al menos 8 caracteres).");
  }
  const d = parseado.data;

  const existe = await prisma.usuario.findUnique({
    where: { email: d.email.toLowerCase().trim() },
  });
  if (existe) return errorJson("Ya hay un usuario con ese email.", 409);

  const usuario = await prisma.usuario.create({
    data: {
      nombre: d.nombre,
      email: d.email.toLowerCase().trim(),
      passwordHash: await bcrypt.hash(d.password, 10),
      rol: d.rol,
    },
    select: { id: true, nombre: true, email: true, rol: true, activo: true },
  });
  return NextResponse.json(usuario, { status: 201 });
}

export const POST = withApi(handlerPOST);
