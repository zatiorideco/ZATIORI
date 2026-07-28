import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { guard, errorJson, withApi } from "@/lib/api-auth";

const esquemaPatch = z.object({
  nombre: z.string().min(2).max(100).optional(),
  rol: z.enum(["ADMIN", "VENTAS", "FABRICA"]).optional(),
  activo: z.boolean().optional(),
  password: z.string().min(8).max(100).optional(),
});

async function handlerPATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { session, error } = await guard("ADMIN");
  if (error) return error;

  const parseado = esquemaPatch.safeParse(await req.json().catch(() => null));
  if (!parseado.success) {
    return errorJson("Datos inválidos (la contraseña necesita al menos 8 caracteres).");
  }
  const d = parseado.data;

  // Nadie se baja a sí mismo el rol ni se desactiva
  if (
    params.id === session.user.id &&
    (d.activo === false || (d.rol && d.rol !== "ADMIN"))
  ) {
    return errorJson("No podés desactivarte ni quitarte el rol ADMIN a vos mismo.", 400);
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: {
        ...(d.nombre && { nombre: d.nombre }),
        ...(d.rol && { rol: d.rol }),
        ...(d.activo !== undefined && { activo: d.activo }),
        ...(d.password && { passwordHash: await bcrypt.hash(d.password, 10) }),
      },
      select: { id: true, nombre: true, email: true, rol: true, activo: true },
    });
    return NextResponse.json(usuario);
  } catch {
    return errorJson("Usuario no encontrado", 404);
  }
}

export const PATCH = withApi(handlerPATCH);
