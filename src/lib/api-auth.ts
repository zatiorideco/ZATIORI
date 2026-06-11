import { NextResponse } from "next/server";
import { requireRol } from "@/lib/auth";
import type { Rol } from "@prisma/client";

/** Guard para API routes del panel: devuelve la sesión o una respuesta 401 JSON. */
export async function guard(...roles: Rol[]) {
  const session = await requireRol(...roles);
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

export function errorJson(mensaje: string, status = 400) {
  return NextResponse.json({ error: mensaje }, { status });
}
