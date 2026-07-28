import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const esquema = z.object({
  nombre: z.string().min(2).max(100),
  whatsapp: z
    .string()
    .min(8)
    .max(20)
    .regex(/^[\d\s+\-()]+$/, "Teléfono inválido"),
});

/** Captación pública (popup "Enterate primero"): crea el cliente en el CRM
 *  con una nota de origen. Si el teléfono ya existe, solo agrega la nota. */
export async function POST(req: Request) {
  const parseado = esquema.safeParse(await req.json().catch(() => null));
  if (!parseado.success) {
    return NextResponse.json(
      { error: parseado.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const nombre = parseado.data.nombre.trim();
  const telefono = parseado.data.whatsapp.replace(/[\s\-()]/g, "");

  try {
    const existente = await prisma.cliente.findFirst({
      where: { telefono },
    });

    const nota =
      "Popup web: se anotó para enterarse primero cuando entran piezas nuevas.";

    if (existente) {
      await prisma.interaccionCliente.create({
        data: { clienteId: existente.id, tipo: "NOTA", contenido: nota },
      });
    } else {
      await prisma.cliente.create({
        data: {
          nombre,
          telefono,
          origen: "WEB",
          notas: nota,
          interacciones: { create: { tipo: "NOTA", contenido: nota } },
        },
      });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("[captacion] error creando lead del popup:", e);
    return NextResponse.json(
      { error: "No pudimos anotarte. Probá de nuevo en un rato." },
      { status: 500 }
    );
  }
}
