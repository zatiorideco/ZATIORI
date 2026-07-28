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

type ContextoRuta = { params: Record<string, string> };

/** Envuelve un handler de API: captura errores no manejados, los loguea
 *  con método y ruta, y devuelve un JSON 500 con mensaje útil en vez de
 *  un "Internal Server Error" pelado. */
export function withApi<C extends ContextoRuta = ContextoRuta>(
  handler: (req: Request, ctx: C) => Promise<Response>
) {
  return async (req: Request, ctx: C): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      const ruta = (() => {
        try {
          return new URL(req.url).pathname;
        } catch {
          return req.url;
        }
      })();
      console.error(`[api] ${req.method} ${ruta} falló:`, e);
      const detalle = e instanceof Error ? e.message : String(e);
      return NextResponse.json(
        { error: `Algo salió mal procesando la solicitud. Detalle: ${detalle}` },
        { status: 500 }
      );
    }
  };
}
